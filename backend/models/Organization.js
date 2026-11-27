const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    type: {
      type: String,
      enum: { values: ["ward_office", "municipality", "ngo", "cooperative", "other"], message: "Invalid organization type" },
      required: [true, "Organization type is required"],
    },
    website: { type: String, trim: true, default: "" },
    verificationStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    rejectionReason: { type: String, trim: true, default: "" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);