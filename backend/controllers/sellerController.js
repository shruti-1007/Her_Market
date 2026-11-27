const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const User = require("../models/User");

const profileFields = "name businessName profileImage location description createdAt";

const publicProfile = (user) => ({
  id: String(user._id),
  name: user.name,
  businessName: user.businessName,
  profileImage: user.profileImage,
  location: user.location,
  description: user.description,
  createdAt: user.createdAt,
});

const removeUpload = (filePath) => {
  if (!filePath || !filePath.startsWith("/uploads/")) return;
  fs.unlink(path.join(__dirname, "..", filePath), (err) => {
    if (err && err.code !== "ENOENT") console.error(err);
  });
};

const validationErrors = (err) =>
  err.name === "ValidationError"
    ? Object.values(err.errors).map((error) => error.message)
    : null;

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id, role: "seller" });
    if (!user) return res.status(404).json({ success: false, message: "Seller profile not found" });
    res.json({ success: true, profile: publicProfile(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateMyProfile = async (req, res) => {
  const newImage = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const user = await User.findOne({ _id: req.user.id, role: "seller" });
    if (!user) {
      removeUpload(newImage);
      return res.status(404).json({ success: false, message: "Seller profile not found" });
    }

    const fields = ["name", "businessName", "location", "description"];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "string") {
          removeUpload(newImage);
          return res.status(400).json({ success: false, message: `Invalid ${field}` });
        }
        user[field] = req.body[field].trim();
      }
    }
    const oldImage = user.profileImage;
    if (newImage) user.profileImage = newImage;
    await user.save();
    if (newImage) removeUpload(oldImage);

    res.json({ success: true, profile: publicProfile(user) });
  } catch (err) {
    removeUpload(newImage);
    const errors = validationErrors(err);
    if (errors) return res.status(400).json({ success: false, message: "Validation failed", errors });
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.sellerId))
      return res.status(404).json({ success: false, message: "Seller not found" });

    const user = await User.findOne({ _id: req.params.sellerId, role: "seller" }).select(profileFields);
    if (!user) return res.status(404).json({ success: false, message: "Seller not found" });

    const listings = await Listing.find({ seller: user._id, availability: "available" })
      .sort({ createdAt: -1 });
    res.json({ success: true, seller: publicProfile(user), listings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
