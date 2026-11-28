const router = require("express").Router();
const { getMyOrganization, updateMyOrganizationProfile } = require("../controllers/organizationController");
const { protect, authorize } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

router.get("/me", protect, authorize("organization"), getMyOrganization);
router.put("/me", protect, authorize("organization"), uploadImage, updateMyOrganizationProfile);

module.exports = router;