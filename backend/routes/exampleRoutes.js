const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");

router.get("/seller-only", protect, authorize("seller"), (req, res) =>
  res.json({ success: true, message: "Hello seller", user: req.user }));

router.get("/customer-only", protect, authorize("customer"), (req, res) =>
  res.json({ success: true, message: "Hello customer", user: req.user }));

module.exports = router;