const router = require("express").Router();
const c = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/auth");
const { requireVerifiedOrg } = require("../middleware/verifiedOrg");
const { uploadImages } = require("../middleware/upload");

router.get("/", c.getEvents);
router.get("/mine", protect, authorize("organization"), c.getMyEvents); // keep ABOVE "/:id"
router.get("/:id", c.getEvent);
router.post("/", protect, authorize("organization"), requireVerifiedOrg, uploadImages, c.createEvent);
router.put("/:id", protect, authorize("organization"), uploadImages, c.updateEvent);
router.delete("/:id", protect, authorize("organization"), c.deleteEvent);

module.exports = router;