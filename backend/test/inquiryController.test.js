const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Inquiry = require("../models/Inquiry");
const Listing = require("../models/Listing");
const inquiryController = require("../controllers/inquiryController");

const invokeCreateInquiry = async ({ quantity }) => {
  const originalFindById = Listing.findById;
  const originalCreate = Inquiry.create;
  const listing = {
    _id: new mongoose.Types.ObjectId(),
    seller: new mongoose.Types.ObjectId(),
    availability: "available",
    price: 300,
    packSize: "500 g jar",
  };
  let created;
  const result = { status: 200, body: null };
  const response = {
    status(status) {
      result.status = status;
      return this;
    },
    json(body) {
      result.body = body;
      return this;
    },
  };

  Listing.findById = async () => listing;
  Inquiry.create = async (input) => {
    created = input;
    return input;
  };
  try {
    await inquiryController.createInquiry({
      body: {
        listingId: String(listing._id),
        message: "I would like to order these.",
        quantity,
      },
      user: { id: String(new mongoose.Types.ObjectId()) },
    }, response);
    return { ...result, created };
  } finally {
    Listing.findById = originalFindById;
    Inquiry.create = originalCreate;
  }
};

test("inquiries snapshot pack size and calculate a quantity total from the listing price", async () => {
  const result = await invokeCreateInquiry({ quantity: "3" });

  assert.equal(result.status, 201);
  assert.equal(result.created.quantity, 3);
  assert.equal(result.created.packSize, "500 g jar");
  assert.equal(result.created.unitPriceNpr, 300);
  assert.equal(result.created.estimatedTotalNpr, 900);
});

test("inquiry pack counts must be positive whole numbers", async () => {
  const result = await invokeCreateInquiry({ quantity: "1.5" });

  assert.equal(result.status, 400);
  assert.match(result.body.message, /whole number/);
  assert.equal(result.created, undefined);
});
