const router = require("express").Router();
const c = require("../controllers/sellerController");
const { protect, authorize } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

router.get("/me", protect, authorize("seller"), c.getMyProfile);
router.put("/me", protect, authorize("seller"), uploadImage, c.updateMyProfile);
router.get("/:sellerId", c.getPublicProfile);

module.exports = router;
