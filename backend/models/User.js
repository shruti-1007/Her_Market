const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"], trim: true },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, select: false }, // hidden from queries by default
  role: { type: String, enum: ["seller", "customer", "organization", "admin"], default: "customer" },
  location: { type: String, trim: true, default: "" },
  description: { type: String, trim: true, default: "" },
  contact: { type: String, trim: true, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);