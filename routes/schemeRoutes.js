const express = require("express");
const Scheme = require("../models/Scheme");
const authenticate = require("../middleware/auth");

const router = express.Router();

// Get all schemes
router.get("/", async (req, res) => {
    try {
        const schemes = await Scheme.find();
        res.json(schemes);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Add a scheme (Admin only)
router.post("/", authenticate, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    try {
        const { title, description, eligibility } = req.body;
        const scheme = new Scheme({ title, description, eligibility });
        await scheme.save();
        res.json({ message: "Scheme added successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
