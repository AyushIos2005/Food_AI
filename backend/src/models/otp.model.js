const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            index: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        otp: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });
otpSchema.index({ email: 1, createdAt: -1 });

const otpModel = mongoose.model("OTP", otpSchema);

module.exports = otpModel;
