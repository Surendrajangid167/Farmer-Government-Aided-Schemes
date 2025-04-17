const mongoose = require("mongoose"); 

const CropSchema = new mongoose.Schema({
    name: { type: String, required: true },
    season: { type: String, required: true },
    details: { type: String, required: true }
});

const Crop = mongoose.model("Crop", CropSchema);
module.exports = Crop;
