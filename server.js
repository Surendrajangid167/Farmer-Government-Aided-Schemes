const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const winston = require("winston");
const User = require("./models/User");
const Scheme = require("./models/Scheme");
const Crop = require("./models/Crop");
const applicationRoutes = require("./routes/applicationRoutes");
const authenticate = require("./middleware/auth"); // Adjust path if needed

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [new winston.transports.Console()],
});

mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => logger.info("MongoDB Connected Successfully"))
    .catch((err) => {
        logger.error("MongoDB Connection Error: " + err);
        process.exit(1);
    });

app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            logger.warn("Missing Fields in Register Request");
            return res.status(400).json({ success: false, message: "Email and Password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.warn("User Already Exists: " + email);
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const newUser = new User({ email, password });
        await newUser.save();
        logger.info("New User Registered: " + email);
        res.json({ success: true, message: "Registration Successful" });
    } catch (error) {
        logger.error("Error in Register API: " + error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

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

app.post("/addScheme", async (req, res) => {
    try {
        const { name, season, code, details } = req.body;
        if (!name || !season || !code || !details) {
            logger.warn("Missing Fields in Add Scheme Request");
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newScheme = new Scheme({ name, season, code, details });
        await newScheme.save();
        logger.info("Scheme Added: " + name);
        res.json({ success: true, message: "Scheme Added Successfully" });
    } catch (error) {
        logger.error("Error in Add Scheme API: " + error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.get("/getSchemes", async (req, res) => {
    try {
        const schemes = await Scheme.find();
        res.json({ success: true, schemes });
    } catch (error) {
        logger.error("Error in Get Schemes API: " + error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.post("/addCrop", async (req, res) => {
    try {
        const { name, season, details } = req.body;
        if (!name || !season || !details) {
            logger.warn("Missing Fields in Add Crop Request");
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newCrop = new Crop({ name, season, details });
        await newCrop.save();
        logger.info("Crop Added: " + name);
        res.json({ success: true, message: "Crop Added Successfully" });
    } catch (error) {
        logger.error("Error in Add Crop API: " + error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.get("/getCrops", async (req, res) => {
    try {
        const crops = await Crop.find();
        if (crops.length === 0) {
            logger.warn("No Crops Found");
            return res.status(404).json({ success: false, message: "No Crops Available" });
        }
        res.json({ success: true, crops });
    } catch (error) {
        logger.error("Error in Get Crops API: " + error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.use("/application", applicationRoutes);


app.post("/applications/apply", authenticate, async (req, res) => {
    try {
        const { schemeId } = req.body; // This is actually the scheme "code"
        const userId = req.user.userId;

        logger.info("SCHEME APPLY: Attempting to apply for scheme with code: " + schemeId);

        // Find the scheme using code, not ObjectId
        const scheme = await Scheme.findOne({ code: schemeId });
        if (!scheme) {
            logger.warn("SCHEME APPLY: Scheme with code not found - " + schemeId);
            return res.status(404).json({ success: false, message: "Scheme not found" });
        }

        const existingApplication = await Application.findOne({
            userId,
            schemeId: scheme._id,
        });

        if (existingApplication) {
            logger.warn("SCHEME APPLY: Duplicate application attempt by user " + userId);
            return res.status(400).json({ success: false, message: "You have already applied for this scheme." });
        }

        const newApplication = new Application({
            userId,
            schemeId: scheme._id,
            status: "pending",
        });

        await newApplication.save();

        logger.info("SCHEME APPLY: Application submitted successfully for scheme code: " + schemeId);
        res.status(200).json({ success: true, message: "Scheme application successful!" });

    } catch (error) {
        logger.error("SCHEME APPLY ERROR: " + error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info("Server running on port " + PORT);
});
