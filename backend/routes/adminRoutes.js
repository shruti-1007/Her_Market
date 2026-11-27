const router = require("express").Router();
const c = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));
router.get("/organizations", c.listOrganizations);
router.patch("/organizations/:id/verification", c.reviewOrganization);

module.exports = router;