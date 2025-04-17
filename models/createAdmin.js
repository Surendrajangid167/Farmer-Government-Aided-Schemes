require("dotenv").config(); // Ensure dotenv is loaded before anything

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./User");  // Ensure correct model path

// Ensure MongoDB URI is loaded correctly
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error("MONGO_URI is missing in .env file");
    process.exit(1); // Exit if MONGO_URI is missing
}

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

const createAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ email: "admin@example.com" });
        if (existingAdmin) {
            console.log("Admin already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);
        const admin = new User({
            name: "Admin",
            email: "admin@example.com",
            password: hashedPassword,
            role: "admin"
        });

        await admin.save();
        console.log("Admin created successfully");
    } catch (err) {
        console.error("Error creating admin:", err);
    } finally {
        mongoose.connection.close();
    }
};

createAdmin();
