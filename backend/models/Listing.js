const mongoose = require("mongoose");

const pricingMaterialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    method: { type: String, enum: ["all", "half", "used", "estimated", "exact"], required: true },
    costSource: { type: String, enum: ["seller", "ai"], default: "seller" },
    purchaseCostNpr: { type: Number, min: 0 },
    usedCostNpr: { type: Number, min: 0 },
    estimatedCostNpr: { type: Number, min: 0 },
    totalQuantity: { type: Number, min: 0 },
    quantityUsed: { type: Number, min: 0 },
    usedQuantityDescription: { type: String, trim: true, maxlength: 100, default: "" },
    unit: { type: String, trim: true, maxlength: 30, default: "" },
    costNpr: { type: Number, min: 0, required: true },
  },
  { _id: false },
);

const pricingExpenseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    amountNpr: { type: Number, min: 0, required: true },
  },
  { _id: false },
);

const pricingSchema = new mongoose.Schema(
  {
    materials: { type: [pricingMaterialSchema], default: [] },
    expenses: { type: [pricingExpenseSchema], default: [] },
    materialsConfirmed: { type: Boolean, required: true },
    expensesConfirmed: { type: Boolean, required: true },
    minutesSpent: { type: Number, min: 0 },
    timeEstimated: { type: Boolean, default: false },
    hourlyRateNpr: { type: Number, min: 0, required: true },
    profitMarginPercent: { type: Number, min: 0, max: 200, required: true },
    materialsCostNpr: { type: Number, min: 0, required: true },
    additionalExpensesCostNpr: { type: Number, min: 0, required: true },
    labourCostNpr: { type: Number, min: 0, required: true },
    totalCostNpr: { type: Number, min: 0, required: true },
    profitAmountNpr: { type: Number, min: 0, required: true },
    suggestedPriceNpr: { type: Number, min: 0, required: true },
    finalDecision: { type: String, enum: ["accepted", "changed"], required: true },
    complete: { type: Boolean, required: true },
  },
  { _id: false },
);

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
    pricing: { type: pricingSchema, default: undefined },
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