const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    const { name, email, password, role, location, description, contact } = req.body;

    // Validation
    const errors = [];
    if (!name || !name.trim()) errors.push("Name is required");
    if (!email || !emailRegex.test(email)) errors.push("A valid email is required");
    if (!password || password.length < 8) errors.push("Password must be at least 8 characters");
    if (role && !["seller", "customer"].includes(role)) errors.push("Role must be 'seller' or 'customer'");
    if (role === "seller" && (!location || !contact))
      errors.push("Sellers must provide location and contact");
    if (errors.length) return res.status(400).json({ success: false, message: "Validation failed", errors });

    // Duplicate check
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: "Email already registered" });

    // Hash + save
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashed, role, location, description, contact,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: publicUser(user),
    });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ success: false, message: "Email already registered" });
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