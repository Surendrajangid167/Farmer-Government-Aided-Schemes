const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const authHeader = req.header("Authorization");

    // Check if token is present
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        // Extract token from "Bearer <token>"
        const token = authHeader.split(" ")[1];

        // Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = verified;

        next(); // Proceed to next middleware
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        return res.status(403).json({ error: "Invalid token" });
    }
};

module.exports = authenticate;
