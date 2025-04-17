// const mongoose = require("mongoose");

// const ApplicationSchema = new mongoose.Schema({
//     userEmail: { type: String, required: true }, // Add this field
//     //user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     schemeId: { type: mongoose.Schema.Types.ObjectId, ref: "Scheme", required: true },
//     status: { type: String, enum: ["pending", "approved"], default: "pending" }
// });
// module.exports = mongoose.model("Application", ApplicationSchema);
//
//
//const mongoose = require("mongoose");
// const applicationSchema = new mongoose.Schema({
//     userEmail: String,
//     schemeId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Scheme"
//     },
//     status: {
//         type: String,
//         default: "pending"
//     }
// });

// module.exports = mongoose.model("Application", applicationSchema);
//
//
//
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
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
});

module.exports = mongoose.model("Application", applicationSchema);
