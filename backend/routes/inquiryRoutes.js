const router = require("express").Router();
const c = require("../controllers/inquiryController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("customer"), c.createInquiry);
router.get("/seller", protect, authorize("seller"), c.getSellerInquiries);
router.get("/customer", protect, authorize("customer"), c.getCustomerInquiries);
router.patch("/:id/status", protect, authorize("seller"), c.updateInquiryStatus);

module.exports = router;