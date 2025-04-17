const mongoose = require("mongoose");

const appliedSchemeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    schemeId: { type: mongoose.Schema.Types.ObjectId, ref: "Scheme", required: true }, 
    status: { type: String, enum: ["Pending", "Approved"], default: "Pending" }
});

module.exports = mongoose.model("AppliedScheme", appliedSchemeSchema);
