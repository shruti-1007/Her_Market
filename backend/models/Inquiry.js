const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [3, "Message must be at least 3 characters"],
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity must be at least 1"],
      validate: { validator: Number.isInteger, message: "Quantity must be a whole number" },
    },
    packSize: { type: String, trim: true, maxlength: 60, default: "" },
    unitPriceNpr: { type: Number, min: 0 },
    estimatedTotalNpr: { type: Number, min: 0 },
    status: {
      type: String,
      enum: { values: ["pending", "accepted", "rejected"], message: "Invalid status" },
      default: "pending",
    },
  },
  { timestamps: true } // createdAt + updatedAt
);

module.exports = mongoose.model("Inquiry", inquirySchema);