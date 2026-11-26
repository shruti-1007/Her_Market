
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

dotenv.config();
console.log("Mongo URI exists:", !!process.env.MONGO_URI);
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check API
app.get("/api/health", (req, res) => {
    const dbStatus = mongoose.connection.readyState;

    res.status(200).json({
        status: "success",
        message: "Server is running!",
        database: dbStatus === 1 ? "Connected" : "Disconnected"
    });
});

// Connect database and start server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
