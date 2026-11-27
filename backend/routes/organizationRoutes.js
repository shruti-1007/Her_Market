const router = require("express").Router();
const { getMyOrganization } = require("../controllers/organizationController");
const { protect, authorize } = require("../middleware/auth");

router.get("/me", protect, authorize("organization"), getMyOrganization);

module.exports = router;