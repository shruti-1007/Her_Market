const test = require("node:test");
const assert = require("node:assert/strict");
const Organization = require("../models/Organization");
const User = require("../models/User");
const organizationController = require("../controllers/organizationController");

test("organization profile pictures are saved to the organization user's profile", async () => {
  const originalFindOrganization = Organization.findOne;
  const originalFindUser = User.findOne;
  const organization = { populate: async () => organization };
  const user = { profileImage: "", save: async () => {} };
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

  Organization.findOne = async () => organization;
  User.findOne = async () => user;
  try {
    await organizationController.updateMyOrganizationProfile({
      file: { filename: "ward-profile.png" },
      user: { id: "organization-user-id" },
    }, response);

    assert.equal(result.status, 200);
    assert.equal(user.profileImage, "/uploads/ward-profile.png");
    assert.equal(result.body.organization, organization);
  } finally {
    Organization.findOne = originalFindOrganization;
    User.findOne = originalFindUser;
  }
});

test("organization profile picture updates require an uploaded image", async () => {
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

  await organizationController.updateMyOrganizationProfile({ user: { id: "organization-user-id" } }, response);

  assert.equal(result.status, 400);
  assert.match(result.body.message, /profile picture is required/i);
});
