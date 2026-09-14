const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "chef"],
        default: "user"
    },
    status: {
        type: Boolean,
        default: false
    },
    follower: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    resetOtp: {
        type: String
    },
    resetOtpExpires: {
        type: Date
    }
}, { timestamps: true });

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
