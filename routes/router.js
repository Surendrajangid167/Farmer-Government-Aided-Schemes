const express = require("express");
const router = new express.Router();
const userdb = require("../models/userSchema");
var bcrypt = require("bcryptjs");
const authenticate = require("../middleware/auth");

// User Registration
router.post("/register", async (req, res) => {
    const { fname, email, password, cpassword } = req.body;

    if (!fname || !email || !password || !cpassword) {
        return res.status(422).json({ success: false, message: "Fill all the details" });
    }

    try {
        const preuser = await userdb.findOne({ email: email });

        if (preuser) {
            return res.status(400).json({ success: false, message: "User already registered" });
        } else if (password !== cpassword) {
            return res.status(422).json({ success: false, message: "Password and Confirm Password do not match" });
        } else {
            const finalUser = new userdb({ fname, email, password, cpassword });

            // Save user
            await finalUser.save();

            return res.status(201).json({ success: true, message: "User registered successfully" });
        }
    } catch (error) {
        console.error("Registration Error:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ success: false, message: "Fill all the details" });
    }

    try {
        const userValid = await userdb.findOne({ email: email });

        if (userValid) {
            const isMatch = await bcrypt.compare(password, userValid.password);

            if (!isMatch) {
                return res.status(422).json({ success: false, message: "Invalid details" });
            } else {
                // Token generation
                const token = await userValid.generateAuthtoken();

                // Set cookie
                res.cookie("usercookie", token, {
                    expires: new Date(Date.now() + 9000000),
                    httpOnly: true
                });

                return res.status(201).json({ success: true, token, message: "Login successful" });
            }
        } else {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Login Error:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Validate User
router.get("/validuser", authenticate, async (req, res) => {
    try {
        const ValidUserOne = await userdb.findOne({ _id: req.userId });
        return res.status(201).json({ success: true, ValidUserOne });
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
});

// User Logout
router.get("/logout", authenticate, async (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => curelem.token !== req.token);

        res.clearCookie("usercookie", { path: "/" });

        await req.rootUser.save();

        return res.status(201).json({ success: true, message: "Logout successful" });
    } catch (error) {
        return res.status(401).json({ success: false, message: "Logout failed" });
    }
});

module.exports = router;
