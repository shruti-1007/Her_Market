const mongoose = require("mongoose");

const urlValidator = {
  validator: (v) => !v || /^https?:\/\/.+/i.test(v),
  message: "Links must start with http:// or https://",
};

const eventSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: {
      type: String, required: [true, "Title is required"], trim: true,
      minlength: [3, "Title must be at least 3 characters"], maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: { type: String, trim: true, maxlength: [3000, "Description cannot exceed 3000 characters"], default: "" },
    category: {
      type: String, required: [true, "Category is required"],
      enum: { values: ["workshop", "training", "fair", "funding", "awareness", "health", "other"], message: "Invalid category" },
    },
    startDate: { type: Date, required: [true, "Start date and time are required"], index: true },
    endDate: {
      type: Date,
      validate: {
        validator: function (v) { return !v || !this.startDate || v >= this.startDate; },
        message: "End date cannot be before the start date",
      },
    },
    isOnline: { type: Boolean, default: false },
    location: {
      type: String, trim: true, default: "",
      required: [function () { return !this.isOnline; }, "Location is required for in-person events"],
    },
    onlineLink: { type: String, trim: true, default: "", validate: urlValidator },
    registrationInstructions: { type: String, trim: true, maxlength: [1000, "Instructions cannot exceed 1000 characters"], default: "" },
    registrationUrl: { type: String, trim: true, default: "", validate: urlValidator },
    images: [{ type: String }], // first image is the poster
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);