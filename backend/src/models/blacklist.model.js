const mongoose = require("mongoose");

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "token is required to be added in blacklist"],
        unique: true
    }
}, {
    timestamps: true
});

blacklistTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

const tokenBlacklistModel = mongoose.model("blacklistToken", blacklistTokenSchema);

module.exports = tokenBlacklistModel;
