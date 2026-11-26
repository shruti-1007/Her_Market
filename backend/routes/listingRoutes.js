const router = require("express").Router();
const c = require("../controllers/listingController");
const { protect, authorize } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

router.get("/", c.getListings);
router.get("/mine", protect, authorize("seller"), c.getMyListings); // keep ABOVE "/:id"
router.get("/:id", c.getListing);
router.post("/", protect, authorize("seller"), uploadImage, c.createListing);
router.put("/:id", protect, authorize("seller"), uploadImage, c.updateListing);
router.delete("/:id", protect, authorize("seller"), c.deleteListing);

module.exports = router;