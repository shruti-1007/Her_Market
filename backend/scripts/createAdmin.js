const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require('dotenv').config({ path: '../.env' });

(async () => {
  const [, , email, password, name = "HerMarket Admin"] = process.argv;
  if (!email || !password || password.length < 8) {
    console.log('Usage: node scripts/createAdmin.js <email> <password (8+ chars)> ["Name"]');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  if (await User.findOne({ email: email.toLowerCase() })) {
    console.log("A user with that email already exists");
  } else {
    await User.create({ name, email, password: await bcrypt.hash(password, 10), role: "admin" });
    console.log("Admin created:", email);
  }
  await mongoose.disconnect();
})();