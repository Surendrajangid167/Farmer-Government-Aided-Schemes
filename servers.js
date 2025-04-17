const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const winston = require("winston");
const User = require("./models/User");
const Scheme = require("./models/Scheme");
const Crop = require("./models/Crop");
const Application = require("./models/Application"); // Added Application Model
const jwt = require("jsonwebtoken");
const authenticate = require("./middleware/auth");
const applicationRoutes = require("./routes/applicationRoutes");
const router = express.Router();
const app = express();
dotenv.config();
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

// app.post("/login", async (req, res) => {
//     try {
//         const { email, password, role } = req.body;
//         if (!email || !password || !role) {
//             logger.warn("Missing Fields in Login Request");
//             return res.status(400).json({ success: false, message: "Email, Password, and Role are required" });
//         }

//         if (role === "admin") {
//             if (email === "admin@admin.com" && password === "admin123") {
//                 logger.info("Admin Logged In: " + email);
//                 const token = jwt.sign({ email, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
//                 return res.json({ success: true, message: "Admin Login Successful", token });
//             } else {
//                 logger.warn("Invalid Admin Login Attempt: " + email);
//                 return res.status(401).json({ success: false, message: "Invalid Admin Credentials" });
//             }
//         }

//         const user = await User.findOne({ email });
//         if (!user || user.password !== password) {
//             logger.warn("Invalid User Login Attempt: " + email);
//             return res.status(401).json({ success: false, message: "Invalid User Credentials" });
//         }

//         const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

//         logger.info("User Logged In: " + email);
//         res.json({ success: true, message: "User Login Successful", token });
//     } catch (error) {
//         logger.error("Error in Login API: " + error);
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// });
// POST /login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("Login attempt:", email, password);

        // Check for Admin credentials
        if (email === "admin@admin.com" && password === "admin123") {
            logger.info("Admin Logged In: " + email);

            const token = jwt.sign(
                { email, role: "admin" },
                process.env.JWT_SECRET || "mySecretKey",
                { expiresIn: "1h" }
            );

            return res.json({
                success: true,
                message: "Admin Login Successful",
                token,
                userEmail: email,
                role: "admin"
            });
        }

        // Check for User
        const user = await User.findOne({ email });

        if (!user) {
            logger.warn("User not found: " + email);
            return res.status(400).json({ message: "User not found" });
        }

        if (user.password !== password) {
            logger.warn("Password mismatch for user: " + email);
            return res.status(400).json({ message: "Password mismatch" });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || "mySecretKey",
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token,
            userEmail: user.email,
            role: user.role
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
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

// app.use("/applyScheme", applicationRoutes);

// app.post("/applications/apply", authenticate, async (req, res) => {
//     try {
//         const { schemeId } = req.body; // This is actually the scheme "code"
//         const userId = req.user.userId;

//         logger.info("SCHEME APPLY: Attempting to apply for scheme with code: " + schemeId);

//         // Find the scheme using code, not ObjectId
//         const scheme = await Scheme.findOne({ code: schemeId });
//         if (!scheme) {
//             logger.warn("SCHEME APPLY: Scheme with code not found - " + schemeId);
//             return res.status(404).json({ success: false, message: "Scheme not found" });
//         }

//         const existingApplication = await Application.findOne({
//             userId,
//             schemeId: scheme._id,
//         });

//         if (existingApplication) {
//             logger.warn("SCHEME APPLY: Duplicate application attempt by user " + userId);
//             return res.status(400).json({ success: false, message: "You have already applied for this scheme." });
//         }

//         const newApplication = new Application({
//             userId,
//             schemeId: scheme._id,
//             status: "pending",
//         });

//         await newApplication.save();

//         logger.info("SCHEME APPLY: Application submitted successfully for scheme code: " + schemeId);
//         res.status(200).json({ success: true, message: "Scheme application successful!" });

//     } catch (error) {
//         logger.error("SCHEME APPLY ERROR: " + error.message);
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// });
//post apply scheme


app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  }); 
// POST /applications/apply
app.post("/applications/apply", async (req, res) => {
    try {
        const { schemeCode, userEmail } = req.body;

        console.log("Apply request received:", req.body); //  initial debug

        const user = await User.findOne({ email: userEmail });
        const scheme = await Scheme.findOne({ code: schemeCode });

        //  Debug logs:
        console.log("User found:", user);
        console.log("Scheme found:", scheme);

        if (!user || !scheme) {
            return res.status(404).json({ message: "User or Scheme not found" });
        }

        const application = new Application({
            userEmail: userEmail,
            user: user._id,
            schemeId: scheme._id,
        });

        await application.save();
        res.status(201).json({ message: "Application submitted successfully" });
    } catch (error) {
        console.error("Apply Scheme Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//   app.get("/applications/pending", async (req, res) => {
//     try {
//       const applications = await Application.find({ status: "pending" })
//         .populate("user")  //  fetch full user details
//         .populate("schemeId");  // optional: show scheme name too
  
//       res.json({ applications });
//     } catch (err) {
//       console.error("Error:", err);
//       res.status(500).json({ message: "Could not fetch applications" });
//     }
//   });
app.get("/admin/pendingApplications", async (req, res) => {
    try {
        const applications = await Application.find({ status: "pending" })
            .populate("schemeId"); //  Populating scheme details

        res.json({ success: true, applications });
    } catch (error) {
        console.error("Error fetching pending applications:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.get("/applications", async (req, res) => {
    try {
      const applications = await Application.find();
      res.json({ success: true, applications });
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });
  
  
//   app.put("/applications/approve/:id", async (req, res) => {
//     try {
//       const updated = await Application.findByIdAndUpdate(
//         req.params.id,
//         { status: "Approved" },
//         { new: true }
//       );
//       res.json({ success: true, message: "Application Approved", updated });
//     } catch (err) {
//       res.status(500).json({ success: false, message: "Approval failed" });
//     }
//   });
app.post("/admin/approve/:id", async (req, res) => {
    try {
        const applicationId = req.params.id;
        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        application.status = "approved";
        await application.save();

        res.json({ success: true, message: "Application approved" });
    } catch (err) {
        console.error("Error approving application:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

  app.post("/admin/reject/:id", async (req, res) => {
    await Application.findByIdAndUpdate(req.params.id, { status: "rejected" });
    res.json({ success: true });
});

// server.js or routes file
app.get("/user/applications", async (req, res) => {
    try {
      const email = req.query.email;
  
      // First find user
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Get both types of applications (by userId or userEmail)
      const applications = await Application.find({
        $or: [
          { userId: user._id },
          { userEmail: email } // legacy support
        ]
      }).populate("schemeId");
  
      if (!applications || applications.length === 0) {
        return res.json({ success: true, applications: [] });
      }
  
      res.json({ success: true, applications });
    } catch (err) {
      console.error("Fetch User Applications Error:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });
  

app.get("/getUserSchemes", async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            logger.warn("Missing User ID in Get Status Request");
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const applications = await Application.find({ user: userId });
        res.json({ success: true, schemes: applications });
    } catch (error) {
        logger.error("Error in Get User Schemes API: " + error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info("Server running on port " + PORT);
});