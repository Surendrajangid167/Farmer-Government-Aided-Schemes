const mongoose = require("mongoose");

const SchemeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    season: { type: String, required: true },
    code: { type: String, required: true },
    details: { type: String, required: true }
});

module.exports = mongoose.model("Scheme", SchemeSchema);
