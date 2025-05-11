const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    schemeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scheme"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    userEmail: String,
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
});

module.exports = mongoose.model("Application", applicationSchema);
