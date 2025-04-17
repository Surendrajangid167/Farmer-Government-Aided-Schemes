const express = require("express");
const Crop = require("../models/Crop");
const authenticate = require("../middleware/auth");

const router = express.Router();

// Get all crops
router.get("/", async (req, res) => {
    try {
        const crops = await Crop.find();
        res.json(crops);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Add a crop (Admin only)
router.post("/", authenticate, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    try {
        const { name, season, details } = req.body;
        const crop = new Crop({ name, season, details });
        await crop.save();
        res.json({ message: "Crop added successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
