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
      default: "product", // optional: everything is a product unno not with the customer view point, its a ecommerce platform, we have two sign in portals. i can sign in as a seller and a customer. what i want to do is: 1)take me as a seller, i sign in as a seller and i list out some products. now a small profile must be shown in my side bar, like it shows as google account. Also, that profile must be shown to customer if they want to visit, through profile link attached in the product itself.  And, there must be some analytics part that must be seen in seller, own's profile only, like we now have listing and inquires, listing includes what products they listed and inquiries include order and all. now, there must be some analytical section that shows how many people visit the profile, how many people see the products. who orders it, pending payment etc. So, how can I do this?less stated otherwise
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