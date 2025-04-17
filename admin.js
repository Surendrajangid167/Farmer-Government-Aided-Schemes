const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const winston = require("winston");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Logger setup
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: "server.log" })
    ]
});

// Check for required environment variables
if (!process.env.MONGO_URI) {
    logger.error("MONGO_URI is missing in .env file");
    console.error("MONGO_URI is missing in .env file");
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    logger.error("JWT_SECRET is missing in .env file");
    console.error("JWT_SECRET is missing in .env file");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected");
    logger.info("MongoDB connected successfully");
}).catch(err => {
    console.error("MongoDB Connection Error:", err);
    logger.error("MongoDB connection error: " + err.message);
    process.exit(1);
});

// Import Models
const User = require("./models/User");
const Crop = require("./models/Crop");
const Scheme = require("./models/Scheme");
const Application = require("./models/Application");

app.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            logger.warn("Missing Fields in Login Request");
            return res.status(400).json({ success: false, message: "Email, Password, and Role are required" });
        }

        if (role === "admin") {
            if (email === "admin@admin.com" && password === "admin123") {
                logger.info("Admin Logged In: " + email);
                return res.json({ success: true, message: "Admin Login Successful" });
            } else {
                logger.warn("Invalid Admin Login Attempt: " + email);
                return res.status(401).json({ success: false, message: "Invalid Admin Credentials" });
            }
        }

        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            logger.warn("Invalid User Login Attempt: " + email);
            return res.status(401).json({ success: false, message: "Invalid User Credentials" });
        }

        logger.info("User Logged In: " + email);
        res.json({ success: true, message: "User Login Successful" });
    } catch (error) {
        logger.error("Error in Login API: " + error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Fetch Crops API
app.get("/crops", async (req, res) => {
    try {
        const crops = await Crop.find();
        res.json(crops);
    } catch (err) {
        logger.error("Fetch crops error: " + err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Fetch Schemes API
app.get("/schemes", async (req, res) => {
    try {
        const schemes = await Scheme.find();
        res.json(schemes);
    } catch (err) {
        logger.error("Fetch schemes error: " + err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Apply for Scheme API
app.post("/applications/apply", async (req, res) => {
    const { schemeId } = req.body;
    const token = req.headers.authorization;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const application = new Application({ userId: decoded.userId, schemeId, status: "Pending" });
        await application.save();
        res.json({ message: "Applied successfully!" });
    } catch (err) {
        logger.error("Apply scheme error: " + err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Approve Scheme API (Admin Only)
app.put("/applications/approve", async (req, res) => {
    const token = req.headers.authorization;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        await Application.updateMany({ status: "Pending" }, { status: "Approved" });
        res.json({ message: "All pending applications approved" });
    } catch (err) {
        logger.error("Approve scheme error: " + err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    logger.info(`Server started on port ${PORT}`);
});
