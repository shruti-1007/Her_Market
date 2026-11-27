const router = require("express").Router();
const c = require("../controllers/listingController");
const pricing = require("../controllers/pricingController");
const { protect, authorize } = require("../middleware/auth");
const { uploadImage, uploadPricingImage } = require("../middleware/upload");

router.get("/", c.getListings);
router.get("/mine", protect, authorize("seller"), c.getMyListings); // keep ABOVE "/:id"
router.get("/pricing/config", protect, authorize("seller"), pricing.getConfig);
router.post("/pricing/materials", protect, authorize("seller"), uploadPricingImage, pricing.detectMaterials);
router.post("/pricing/material-estimate", protect, authorize("seller"), pricing.estimateMaterialCost);
router.post("/pricing/calculate", protect, authorize("seller"), pricing.calculate);
router.get("/:id", c.getListing);
router.post("/", protect, authorize("seller"), uploadImage, c.createListing);
router.put("/:id", protect, authorize("seller"), uploadImage, c.updateListing);
router.delete("/:id", protect, authorize("seller"), c.deleteListing);

module.exports = router;