const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const User = require("../models/User");
const { buildSavedPricing } = require("../services/pricing");

const SELLER_FIELDS = "name location contact description";

const removeFile = (p) => {
  if (p && p.startsWith("/uploads/")) fs.unlink(path.join(__dirname, "..", p), () => {});
};
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const validationMessage = (err) =>
  err.name === "ValidationError" ? Object.values(err.errors).map((e) => e.message) : null;
const parsePricing = (value) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    if (typeof value === "object" && !Array.isArray(value)) return value;
    const err = new Error("Pricing information is invalid");
    err.status = 400;
    throw err;
  }
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Pricing information is invalid");
    }
    return parsed;
  } catch {
    const err = new Error("Pricing information is invalid");
    err.status = 400;
    throw err;
  }
};
const validatePricing = (input, price) => {
  try {
    return buildSavedPricing(input, price);
  } catch (err) {
    err.status = 400;
    throw err;
  }
};

// POST /api/listings   (seller)   multipart/form-data or JSON
exports.createListing = async (req, res) => {
  const image = req.file ? `/uploads/${req.file.filename}` : "";
  try {
    const { title, description, type, category, price, packSize, location, availability } = req.body;
    const seller = await User.findById(req.user.id);
    const pricingInput = parsePricing(req.body.pricing);
    const pricing = pricingInput ? validatePricing(pricingInput, price) : undefined;

    const listing = await Listing.create({
      title, description, type, category, price, availability,
      packSize,
      location: location || seller.location,
      image,
      pricing,
      seller: req.user.id,
    });
    res.status(201).json({ success: true, message: "Listing created", listing });
  } catch (err) {
    removeFile(image);
    const errors = validationMessage(err);
    if (err.status === 400) return res.status(400).json({ success: false, message: err.message });
    if (errors) return res.status(400).json({ success: false, message: "Validation failed", errors });
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/listings   (public)  ?type=&category=&location=&search=&minPrice=&maxPrice=&page=&limit=
exports.getListings = async (req, res) => {
  try {
    const { type, category, location, search, minPrice, maxPrice } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);

    const q = { availability: "available" }; // only active listings
    if (type) q.type = type;
    if (category) q.category = category;
    if (location) q.location = new RegExp(escapeRegex(location), "i");
    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");
      q.$or = [
        { title: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }
    if (minPrice || maxPrice) {
      q.price = {};
      if (minPrice) q.price.$gte = Number(minPrice);
      if (maxPrice) q.price.$lte = Number(maxPrice);
    }

    const [listings, total] = await Promise.all([
      Listing.find(q).select("-pricing").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("seller", SELLER_FIELDS),
      Listing.countDocuments(q),
    ]);
    res.json({ success: true, total, page, pages: Math.ceil(total / limit), listings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/listings/mine   (seller) all own listings, including unavailable
exports.getMyListings = async (req, res) => {
  try {
    const q = { seller: req.user.id };
    if (req.query.availability) q.availability = req.query.availability;
    const listings = await Listing.find(q).sort({ createdAt: -1 });
    res.json({ success: true, total: listings.length, listings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/listings/:id   (public; unavailable listings are visible only to their owner)
exports.getListing = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ success: false, message: "Listing not found" });

    const listing = await Listing.findById(req.params.id).select("-pricing").populate("seller", SELLER_FIELDS);
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

    if (listing.availability !== "available") {
      let viewerId = null;
      const header = req.headers.authorization;
      if (header && header.startsWith("Bearer ")) {
        try { viewerId = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET).id; } catch (e) {}
      }
      if (!viewerId || String(listing.seller._id) !== viewerId)
        return res.status(404).json({ success: false, message: "Listing not found" });
    }
    res.json({ success: true, listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/listings/:id   (owner)
exports.updateListing = async (req, res) => {
  const newImage = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      removeFile(newImage);
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      removeFile(newImage);
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    if (String(listing.seller) !== req.user.id) {
      removeFile(newImage);
      return res.status(403).json({ success: false, message: "You can only edit your own listings" });
    }

    // Whitelist: seller and timestamps can never be changed from the request
    ["title", "description", "type", "category", "price", "packSize", "location", "availability"].forEach((f) => {
      if (req.body[f] !== undefined) listing[f] = req.body[f];
    });
    const pricingInput = parsePricing(req.body.pricing);
    if (pricingInput) {
      listing.pricing = validatePricing(pricingInput, req.body.price ?? listing.price);
    } else if (req.body.price !== undefined && listing.pricing) {
      const currentPricing = listing.pricing.toObject();
      currentPricing.finalDecision = "changed";
      listing.pricing = currentPricing;
    }
    const oldImage = listing.image;
    if (newImage) listing.image = newImage;

    await listing.save(); // runs validation
    if (newImage) removeFile(oldImage);
    res.json({ success: true, message: "Listing updated", listing });
  } catch (err) {
    removeFile(newImage);
    const errors = validationMessage(err);
    if (err.status === 400) return res.status(400).json({ success: false, message: err.message });
    if (errors) return res.status(400).json({ success: false, message: "Validation failed", errors });
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/listings/:id   (owner)
exports.deleteListing = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ success: false, message: "Listing not found" });
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
    if (String(listing.seller) !== req.user.id)
      return res.status(403).json({ success: false, message: "You can only delete your own listings" });

    removeFile(listing.image);
    await listing.deleteOne();
    res.json({ success: true, message: "Listing deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};