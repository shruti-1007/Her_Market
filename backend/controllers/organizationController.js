const fs = require("fs");
const path = require("path");
const Organization = require("../models/Organization");
const User = require("../models/User");

const USER_FIELDS = "name email location contact description profileImage createdAt";

const removeUpload = (filePath) => {
  if (!filePath || !filePath.startsWith("/uploads/")) return;
  fs.unlink(path.join(__dirname, "..", filePath), (err) => {
    if (err && err.code !== "ENOENT") console.error(err);
  });
};

// GET /api/organizations/me  (organization)
exports.getMyOrganization = async (req, res) => {
  try {
    const organization = await Organization.findOne({ user: req.user.id })
      .populate("user", USER_FIELDS);
    if (!organization) return res.status(404).json({ success: false, message: "Organization profile not found" });
    res.json({ success: true, organization });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/organizations/me  (organization profile picture)
exports.updateMyOrganizationProfile = async (req, res) => {
  const newImage = req.file ? `/uploads/${req.file.filename}` : null;
  let saved = false;

  if (!newImage) {
    return res.status(400).json({ success: false, message: "A profile picture is required" });
  }

  try {
    const organization = await Organization.findOne({ user: req.user.id });
    if (!organization) {
      removeUpload(newImage);
      return res.status(404).json({ success: false, message: "Organization profile not found" });
    }

    const user = await User.findOne({ _id: req.user.id, role: "organization" });
    if (!user) {
      removeUpload(newImage);
      return res.status(404).json({ success: false, message: "Organization profile not found" });
    }

    const oldImage = user.profileImage;
    user.profileImage = newImage;
    await user.save();
    saved = true;
    if (oldImage !== newImage) removeUpload(oldImage);

    await organization.populate("user", USER_FIELDS);
    res.json({ success: true, organization });
  } catch (err) {
    if (!saved) removeUpload(newImage);
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};