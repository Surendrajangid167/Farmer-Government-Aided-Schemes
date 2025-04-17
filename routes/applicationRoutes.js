// const express = require("express");
// const AppliedScheme = require("../models/Appliedscheme");
// const authenticate = require("../middleware/auth"); 
// const router = express.Router();

// // Apply for a scheme (User only)
// router.post("/", authenticate, async (req, res) => {
//     try {
//         const { schemeId } = req.body;
//         if (!schemeId) {
//             return res.status(400).json({ success: false, message: "Scheme ID is required." });
//         }

//         const userId = req.user.userId; // Extract user ID from authentication middleware

//         // Check if the user has already applied for this scheme
//         const existingApplication = await AppliedScheme.findOne({ userId, schemeId });
//         if (existingApplication) {
//             return res.status(400).json({ success: false, message: "You have already applied for this scheme." });
//         }

//         // Create a new application
//         const newApplication = new AppliedScheme({ userId, schemeId });
//         await newApplication.save();

//         res.json({ success: true, message: "Application submitted successfully!" });
//     } catch (err) {
//         console.error("Application Error:", err);
//         res.status(500).json({ success: false, message: "Server error. Please try again later." });
//     }
// });

// module.exports = router;

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
