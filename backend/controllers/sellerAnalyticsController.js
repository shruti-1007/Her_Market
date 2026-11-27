const crypto = require("crypto");
const mongoose = require("mongoose");
const AnalyticsEvent = require("../models/AnalyticsEvent");
const Inquiry = require("../models/Inquiry");
const Listing = require("../models/Listing");
const User = require("../models/User");

const validTrackingId = (value) =>
  typeof value === "string" && /^[A-Za-z0-9-]{16,80}$/.test(value);

const recordView = async (req, res, type) => {
  const { eventId, visitorId } = req.body;
  if (!validTrackingId(eventId) || !validTrackingId(visitorId))
    return res.status(400).json({ success: false, message: "Valid eventId and visitorId are required" });

  let sellerId;
  let listingId;

  if (type === "profile_view") {
    sellerId = req.body.sellerId;
    if (!mongoose.isValidObjectId(sellerId))
      return res.status(400).json({ success: false, message: "A valid sellerId is required" });
    const seller = await User.findOne({ _id: sellerId, role: "seller" }).select("_id");
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });
    sellerId = seller._id;
  } else {
    listingId = req.body.listingId;
    if (!mongoose.isValidObjectId(listingId))
      return res.status(400).json({ success: false, message: "A valid listingId is required" });
    const listing = await Listing.findOne({ _id: listingId, availability: "available" }).select("seller");
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
    sellerId = listing.seller;
    listingId = listing._id;
  }

  const visitorHash = crypto.createHash("sha256").update(visitorId).digest("hex");
  try {
    await AnalyticsEvent.create({
      eventId,
      type,
      seller: sellerId,
      listing: listingId,
      visitorHash,
    });
  } catch (err) {
    if (err.code === 11000) return res.json({ success: true, duplicate: true });
    throw err;
  }

  res.status(201).json({ success: true });
};

exports.trackProfileView = async (req, res) => {
  try {
    await recordView(req, res, "profile_view");
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not record profile view" });
  }
};

exports.trackProductView = async (req, res) => {
  try {
    await recordView(req, res, "product_view");
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not record product view" });
  }
};

exports.getMyAnalytics = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 29);
    since.setUTCHours(0, 0, 0, 0);

    const [
      profileStats,
      productStats,
      productTotals,
      trendRows,
      inquiryRows,
      listings,
    ] = await Promise.all([
      AnalyticsEvent.aggregate([
        { $match: { seller: sellerId, type: "profile_view" } },
        { $group: { _id: null, views: { $sum: 1 }, visitors: { $addToSet: "$visitorHash" } } },
        { $project: { _id: 0, views: 1, uniqueVisitors: { $size: "$visitors" } } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { seller: sellerId, type: "product_view" } },
        { $group: { _id: "$listing", views: { $sum: 1 }, visitors: { $addToSet: "$visitorHash" } } },
        { $project: { views: 1, uniqueVisitors: { $size: "$visitors" } } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { seller: sellerId, type: "product_view" } },
        { $group: { _id: null, views: { $sum: 1 }, visitors: { $addToSet: "$visitorHash" } } },
        { $project: { _id: 0, views: 1, uniqueVisitors: { $size: "$visitors" } } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { seller: sellerId, createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
              type: "$type",
            },
            views: { $sum: 1 },
          },
        },
        { $sort: { "_id.day": 1 } },
      ]),
      Inquiry.aggregate([
        { $match: { seller: sellerId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Listing.find({ seller: sellerId }).select("title price image category availability createdAt").sort({ createdAt: -1 }),
    ]);

    const viewsByListing = new Map(productStats.map((row) => [String(row._id), row]));
    const productPerformance = listings.map((listing) => {
      const stats = viewsByListing.get(String(listing._id));
      return {
        listing,
        views: stats?.views || 0,
        uniqueVisitors: stats?.uniqueVisitors || 0,
      };
    }).sort((a, b) => b.views - a.views);

    const inquiryCounts = { total: 0, pending: 0, accepted: 0, rejected: 0 };
    for (const row of inquiryRows) {
      if (Object.hasOwn(inquiryCounts, row._id)) {
        inquiryCounts[row._id] = row.count;
        inquiryCounts.total += row.count;
      }
    }

    const profile = profileStats[0] || { views: 0, uniqueVisitors: 0 };
    const products = productTotals[0] || { views: 0, uniqueVisitors: 0 };

    res.json({
      success: true,
      analytics: {
        profileViews: profile.views,
        uniqueProfileVisitors: profile.uniqueVisitors,
        productViews: products.views,
        uniqueProductVisitors: products.uniqueVisitors,
        productPerformance,
        mostViewedProducts: productPerformance.filter((item) => item.views > 0).slice(0, 5),
        trends: trendRows.map((row) => ({
          date: row._id.day,
          type: row._id.type,
          views: row.views,
        })),
        inquiries: inquiryCounts,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not load seller analytics" });
  }
};
