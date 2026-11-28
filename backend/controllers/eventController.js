const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const Organization = require("../models/Organization");

const removeFiles = (paths = []) =>
  paths.forEach((p) => p && p.startsWith("/uploads/") && fs.unlink(path.join(__dirname, "..", p), () => {}));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const validationErrors = (err) =>
  err.name === "ValidationError" ? Object.values(err.errors).map((e) => e.message) : null;
const clean = (v) => (v === undefined || v === null || String(v).trim() === "" ? undefined : v);
const populateEvent = (q) =>
  q.populate("organizer", "name location contact description profileImage")
   .populate("organization", "type website verificationStatus");

const FIELDS = ["title", "description", "category", "startDate", "endDate", "isOnline",
  "location", "onlineLink", "registrationInstructions", "registrationUrl"];

// GET /api/events  (public)  ?search=&category=&location=&from=&to=&includePast=&page=&limit=
exports.getEvents = async (req, res) => {
  try {
    const { search, category, location } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 9, 1), 50);

    const verifiedOrgs = await Organization.find({ verificationStatus: "verified" }).distinct("_id");
    const and = [{ organization: { $in: verifiedOrgs } }];

    if (category) and.push({ category });
    if (location) and.push({ location: new RegExp(escapeRegex(location), "i") });
    if (search) {
      const rx = new RegExp(escapeRegex(search), "i");
      and.push({ $or: [{ title: rx }, { description: rx }] });
    }

    // Default: only events that have not ended yet
    const from = req.query.from ? new Date(req.query.from)
      : req.query.includePast === "true" ? null : new Date();
    const to = req.query.to ? new Date(req.query.to) : null;
    if ((from && isNaN(from)) || (to && isNaN(to)))
      return res.status(400).json({ success: false, message: "Invalid date filter" });

    if (from) and.push({ $or: [{ endDate: { $gte: from } }, { endDate: null, startDate: { $gte: from } }] });
    if (to) and.push({ startDate: { $lte: to } });

    const q = { $and: and };
    const [events, total] = await Promise.all([
      populateEvent(Event.find(q).sort({ startDate: 1 }).skip((page - 1) * limit).limit(limit)),
      Event.countDocuments(q),
    ]);
    res.json({ success: true, total, page, pages: Math.ceil(total / limit), events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/events/mine  (organization)
exports.getMyEvents = async (req, res) => {
  try {
    const events = await populateEvent(Event.find({ organizer: req.user.id }).sort({ startDate: -1 }));
    res.json({ success: true, total: events.length, events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/events/:id  (public, only events of verified organizations)
exports.getEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ success: false, message: "Event not found" });
    const event = await populateEvent(Event.findById(req.params.id));
    if (!event || event.organization?.verificationStatus !== "verified")
      return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/events  (verified organization)  multipart/form-data
exports.createEvent = async (req, res) => {
  const images = (req.files || []).map((f) => `/uploads/${f.filename}`);
  try {
    const b = req.body;
    if (!(b.description && b.description.trim()) && images.length === 0) {
      removeFiles(images);
      return res.status(400).json({ success: false, message: "Validation failed",
        errors: ["Add a description or at least one notice image"] });
    }

    const event = await Event.create({
      organization: req.organization._id,
      organizer: req.user.id,
      title: b.title, description: b.description, category: b.category,
      startDate: clean(b.startDate), endDate: clean(b.endDate),
      isOnline: b.isOnline, location: b.location, onlineLink: b.onlineLink,
      registrationInstructions: b.registrationInstructions, registrationUrl: b.registrationUrl,
      images,
    });
    await event.populate([
      { path: "organizer", select: "name location contact description" },
      { path: "organization", select: "type website verificationStatus" },
    ]);
    res.status(201).json({ success: true, message: "Event published", event });
  } catch (err) {
    removeFiles(images);
    const errors = validationErrors(err);
    if (errors) return res.status(400).json({ success: false, message: "Validation failed", errors });
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/events/:id  (owner)  new images replace the old ones
exports.updateEvent = async (req, res) => {
  const newImages = (req.files || []).map((f) => `/uploads/${f.filename}`);
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      removeFiles(newImages);
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    const event = await Event.findById(req.params.id);
    if (!event) { removeFiles(newImages); return res.status(404).json({ success: false, message: "Event not found" }); }
    if (String(event.organizer) !== req.user.id) {
      removeFiles(newImages);
      return res.status(403).json({ success: false, message: "You can only edit your own events" });
    }

    FIELDS.forEach((f) => {
      if (req.body[f] === undefined) return;
      event[f] = f === "endDate" && req.body[f] === "" ? undefined : req.body[f];
    });
    const oldImages = event.images;
    if (newImages.length) event.images = newImages;

    if (!(event.description && event.description.trim()) && event.images.length === 0) {
      removeFiles(newImages);
      return res.status(400).json({ success: false, message: "Validation failed",
        errors: ["Add a description or at least one notice image"] });
    }

    await event.save();
    if (newImages.length) removeFiles(oldImages);
    await event.populate([
      { path: "organizer", select: "name location contact description" },
      { path: "organization", select: "type website verificationStatus" },
    ]);
    res.json({ success: true, message: "Event updated", event });
  } catch (err) {
    removeFiles(newImages);
    const errors = validationErrors(err);
    if (errors) return res.status(400).json({ success: false, message: "Validation failed", errors });
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/events/:id  (owner)
exports.deleteEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ success: false, message: "Event not found" });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (String(event.organizer) !== req.user.id)
      return res.status(403).json({ success: false, message: "You can only delete your own events" });

    removeFiles(event.images);
    await event.deleteOne();
    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};