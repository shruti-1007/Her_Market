const router = require("express").Router();
const c = require("../controllers/sellerAnalyticsController");
const { protect, authorize } = require("../middleware/auth");

router.post("/profile-view", c.trackProfileView);
router.post("/product-view", c.trackProductView);
router.get("/me", protect, authorize("seller"), c.getMyAnalytics);

module.exports = router;
