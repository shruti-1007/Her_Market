const mongoose = require("mongoose");
const Organization = require("../models/Organization");

const USER_FIELDS = "name email location contact description profileImage createdAt";

// GET /api/admin/organizations?status=pending|verified|rejected
exports.listOrganizations = async (req, res) => {
  try {
    const { status } = req.query;
    if (status && !["pending", "verified", "rejected"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid status filter" });

    const organizations = await Organization.find(status ? { verificationStatus: status } : {})
      .sort({ createdAt: -1 })
      .populate("user", USER_FIELDS);
    res.json({ success: true, total: organizations.length, organizations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/admin/organizations/:id/verification   { status: "verified"|"rejected", reason? }
exports.reviewOrganization = async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!["verified", "rejected"].includes(status))
      return res.status(400).json({ success: false, message: "Status must be 'verified' or 'rejected'" });
    if (status === "rejected" && !(reason && reason.trim()))
      return res.status(400).json({ success: false, message: "A reason is required when rejecting" });
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ success: false, message: "Organization not found" });

    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: "Organization not found" });

    org.verificationStatus = status;
    org.rejectionReason = status === "rejected" ? reason.trim() : "";
    org.reviewedAt = new Date();
    await org.save();
    await org.populate("user", USER_FIELDS);

    res.json({ success: true, message: `Organization ${status}`, organization: org });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};