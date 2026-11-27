const Organization = require("../models/Organization");

// GET /api/organizations/me  (organization)
exports.getMyOrganization = async (req, res) => {
  try {
    const organization = await Organization.findOne({ user: req.user.id })
      .populate("user", "name email location contact description createdAt");
    if (!organization) return res.status(404).json({ success: false, message: "Organization profile not found" });
    res.json({ success: true, organization });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};