const mongoose = require("mongoose");

const analyticsEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ["profile_view", "product_view"],
    required: true,
  },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: function () { return this.type === "product_view"; },
  },
  visitorHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

analyticsEventSchema.index({ seller: 1, type: 1, createdAt: -1 });
analyticsEventSchema.index({ listing: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model("AnalyticsEvent", analyticsEventSchema);
