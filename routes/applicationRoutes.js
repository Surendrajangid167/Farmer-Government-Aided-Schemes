const express = require("express");
const router = express.Router();
const Application = require("../models/Application");

// GET all pending applications with user email and scheme code
router.get("/pending", async (req, res) => {
  try {
    const applications = await Application.find({ status: "pending" })
      .populate("userId", "email")         // only fetch user email
      .populate("schemeId", "schemeCode"); // only fetch schemeCode

    res.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

// POST approve an application
router.post("/approve", async (req, res) => {
  try {
    const { applicationId } = req.body;
    await Application.findByIdAndUpdate(applicationId, { status: "approved" });
    res.json({ message: "Application approved successfully" });
  } catch (error) {
    console.error("Error approving application:", error);
    res.status(500).json({ message: "Approval failed" });
  }
});

module.exports = router;
