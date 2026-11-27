const Organization = require("../models/Organization");

// Use after protect + authorize("organization")
exports.requireVerifiedOrg = async (req, res, next) => {
  try {
    const org = await Organization.findOne({ user: req.user.id });
    if (!org) return res.status(404).json({ success: false, message: "Organization profile not found" });
    if (org.verificationStatus !== "verified")
      return res.status(403).json({
        success: false,
        message: "Your organization must be verified before it can publish events",
      });
    req.organization = org;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};