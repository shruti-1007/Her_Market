const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");
const ORG_TYPES = ["ward_office", "municipality", "ngo", "cooperative", "other"];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  location: u.location,
  description: u.description,
  contact: u.contact,
  createdAt: u.createdAt,
});

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, location, description, contact, organizationType, website } = req.body;

    const errors = [];
    if (!name || !name.trim()) errors.push("Name is required");
    if (!email || !emailRegex.test(email)) errors.push("A valid email is required");
    if (!password || password.length < 8) errors.push("Password must be at least 8 characters");
    if (role && !["seller", "customer", "organization"].includes(role))
      errors.push("Role must be 'seller', 'customer' or 'organization'");
    if ((role === "seller" || role === "organization") && (!location || !contact))
      errors.push("Sellers and organizations must provide location and contact");
    if (role === "organization") {
      if (!ORG_TYPES.includes(organizationType)) errors.push("A valid organization type is required");
      if (!description || description.trim().length < 10)
        errors.push("Organization description must be at least 10 characters");
      if (website && !/^https?:\/\/.+/i.test(website))
        errors.push("Website must start with http:// or https://");
    }
    if (errors.length) return res.status(400).json({ success: false, message: "Validation failed", errors });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role, location, description, contact });

    if (role === "organization") {
      try {
        await Organization.create({ user: user._id, type: organizationType, website: website || "" });
      } catch (e) {
        await User.findByIdAndDelete(user._id); // don't leave an organization user without a profile
        throw e;
      }
    }

    res.status(201).json({
      success: true,
      message: role === "organization"
        ? "Registration successful. Your organization is pending verification."
        : "Registration successful",
      user: publicUser(user),
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: "Email already registered" });
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({ success: true, message: "Login successful", token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/auth/me  (protected)
exports.me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user: publicUser(user) });
};