const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
        type: {
      type: String,
      enum: { values: ["product", "service"], message: "Type must be 'product' or 'service'" },
      default: "product", // optional: everything is a product unless stated otherwise
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["food", "crafts", "clothing", "jewelry", "home", "beauty", "education", "repair", "other"],
        message: "Invalid category",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: { type: String, default: "" }, // e.g. "/uploads/1732600000-123.jpg"
    location: { type: String, trim: true, default: "" },
    availability: {
      type: String,
      enum: { values: ["available", "unavailable"], message: "Availability must be 'available' or 'unavailable'" },
      default: "available",
    },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("Listing", listingSchema);