const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const listingRoutes = require("./routes/listingRoutes");



dotenv.config(); // load .env before requiring files that use process.env

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const exampleRoutes = require("./routes/exampleRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");

console.log("Mongo URI exists:", !!process.env.MONGO_URI);

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Health check API
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  res.status(200).json({
    status: "success",
    message: "Server is running!",
    database: dbStatus === 1 ? "Connected" : "Disconnected",
  });
});


app.use("/api/auth", authRoutes);
app.use("/api/example", exampleRoutes); // remove later



app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// with the other routes, before the 404 handler:
app.use("/api/listings", listingRoutes);
app.use("/api/inquiries", inquiryRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Connect database and start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();