const mongoose = require("mongoose");
const Inquiry = require("../models/Inquiry");
const Listing = require("../models/Listing");

const validationErrors = (err) =>
  err.name === "ValidationError" ? Object.values(err.errors).map((e) => e.message) : null;

// POST /api/inquiries   (customer)   { listingId, message, quantity }
exports.createInquiry = async (req, res) => {
  try {
    const { listingId, message, quantity } = req.body;

    if (!listingId || !mongoose.isValidObjectId(listingId))
      return res.status(400).json({ success: false, message: "Validation failed", errors: ["A valid listingId is required"] });

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
    if (listing.availability !== "available")
      return res.status(400).json({ success: false, message: "This listing is no longer available" });

    const packCount = quantity === undefined ? 1 : Number(quantity);
    if (!Number.isSafeInteger(packCount) || packCount < 1 || packCount > 100000) {
      return res.status(400).json({
        success: false,
        message: "Choose a whole number of packs between 1 and 100,000.",
      });
    }
    const estimatedTotalNpr = listing.price * packCount;
    if (!Number.isFinite(estimatedTotalNpr) || estimatedTotalNpr > Number.MAX_SAFE_INTEGER) {
      return res.status(400).json({
        success: false,
        message: "The estimated total is too large. Please ask the seller for a smaller quantity.",
      });
    }

    const inquiry = await Inquiry.create({
      listing: listing._id,
      customer: req.user.id,
      seller: listing.seller, // taken from the listing, never from the request
      message,
      quantity: packCount,
      packSize: listing.packSize || "1 item",
      unitPriceNpr: listing.price,
      estimatedTotalNpr,
    });

    res.status(201).json({ success: true, message: "Inquiry sent", inquiry });
  } catch (err) {
    const errors = validationErrors(err);
    if (errors) return res.status(400).json({ success: false, message: "Validation failed", errors });
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/inquiries/seller   (seller)   ?status=pending|accepted|rejected
exports.getSellerInquiries = async (req, res) => {
  try {
    const q = { seller: req.user.id };
    if (req.query.status) {
      if (!["pending", "accepted", "rejected"].includes(req.query.status))
        return res.status(400).json({ success: false, message: "Invalid status filter" });
      q.status = req.query.status;
    }

    const inquiries = await Inquiry.find(q)
      .sort({ createdAt: -1 })
      .populate("customer", "name email contact location")
      .populate("listing", "title price packSize image category availability");

    res.json({ success: true, total: inquiries.length, inquiries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/inquiries/customer   (customer) inquiries I have sent
exports.getCustomerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .populate("seller", "name contact location")
      .populate("listing", "title price packSize image category availability");

    res.json({ success: true, total: inquiries.length, inquiries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/inquiries/:id/status   (seller, owner)   { status: "accepted" | "rejected" }
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status))
      return res.status(400).json({ success: false, message: "Status must be 'accepted' or 'rejected'" });

    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ success: false, message: "Inquiry not found" });

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });

    if (String(inquiry.seller) !== req.user.id)
      return res.status(403).json({ success: false, message: "You can only update your own inquiries" });

    // Only pending inquiries can change. Accepted and rejected are final.
    if (inquiry.status !== "pending")
      return res.status(400).json({ success: false, message: `Inquiry is already ${inquiry.status} and cannot be changed` });

    inquiry.status = status;
    await inquiry.save();

    await inquiry.populate([
      { path: "customer", select: "name email contact location" },
      { path: "listing", select: "title price packSize image category availability" },
    ]);

    res.json({ success: true, message: `Inquiry ${status}`, inquiry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};