const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { generateOtp, getOtpHtml } = require("../utils/util");
const sendEmail = require("../services/email.service");
const otpModel = require("../models/otp.model");
const tokenBlacklistModel = require("../models/blacklist.model");
const logger = require("../utils/logger");
const { cookieOptions, signTokenPayload } = require("../utils/cookie");

const BCRYPT_ROUNDS = 12;
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_MS = 60 * 1000;

function hashOtp(otp) {
    return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

function safeCompareHex(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

function publicUser(user) {
    return {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
    };
}

function issueAuthCookie(res, user) {
    const token = signTokenPayload(jwt, {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
    });
    res.cookie("token", token, cookieOptions());
    return token;
}

async function RegisterUser(req, res) {
    try {
        const { username, name, email, password, role } = req.body;

        const isAlready = await userModel.findOne({
            $or: [{ username }, { email }]
        }).lean();

        if (isAlready) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const user = await userModel.create({
            username,
            name,
            email,
            password: hash,
            role: role || "user"
        });

        const recentOtp = await otpModel.findOne({ email }).sort({ createdAt: -1 }).lean();
        if (recentOtp && Date.now() - new Date(recentOtp.createdAt).getTime() < OTP_RESEND_MS) {
            issueAuthCookie(res, user);
            return res.status(201).json({
                message: "OTP is send succefully at registerd email",
                user: publicUser(user)
            });
        }

        const otp = generateOtp();
        const html = getOtpHtml(otp);
        const otpHash = hashOtp(otp);

        await otpModel.deleteMany({ email });
        await otpModel.create({
            email,
            user: user._id,
            otp: otpHash
        });

        await sendEmail(email, "OTP Verification", "Your verification OTP has been generated.", html);

        issueAuthCookie(res, user);

        return res.status(201).json({
            message: "OTP is send succefully at registerd email",
            user: publicUser(user)
        });
    } catch (error) {
        logger.error("Register Error", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function LoginUser(req, res) {
    try {
        const { username, email, password } = req.body;

        const user = await userModel.findOne({
            $or: [
                ...(username ? [{ username }] : []),
                ...(email ? [{ email }] : [])
            ]
        });

        if (!user) {
            logger.warn("Login failure", { reason: "unknown_user" });
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            logger.warn("Login failure", { reason: "bad_password" });
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        issueAuthCookie(res, user);

        return res.status(200).json({
            message: `Successfully logged in ${user.username}`,
            user: publicUser(user)
        });
    } catch (error) {
        logger.error("Login Error", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function userotpVerfication(req, res) {
    try {
        const { email, otp } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otpRecord = await otpModel.findOne({ email, user: user._id }).sort({ createdAt: -1 });
        if (!otpRecord) {
            return res.status(400).json({ message: "OTP not found or already used, please request again" });
        }

        if (Date.now() - new Date(otpRecord.createdAt).getTime() > OTP_TTL_MS) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: "OTP expired" });
        }

        const incomingHash = hashOtp(otp);
        if (!safeCompareHex(otpRecord.otp, incomingHash)) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        user.status = true;
        await user.save();
        await otpModel.deleteOne({ _id: otpRecord._id });

        return res.status(200).json({
            message: `${user.email} has been verified`
        });
    } catch (err) {
        logger.error("userotpVerfication error", err);
        return res.status(500).json({ message: "Something went wrong" });
    }
}

async function changePassword(req, res) {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                message: "new password and confirmNewPassword are not Same"
            });
        }

        const user = await userModel.findById(req.userId || req.auth?.id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current Password is Not matched with Pervious" });
        }

        user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        await user.save();

        return res.status(201).json({
            message: "Password updated successfully"
        });
    } catch (err) {
        logger.error("changePassword error", err);
        return res.status(500).json({
            message: "Inteneral server error"
        });
    }
}

async function resetPassword(req, res) {
    try {
        const { email, otp, newPassword, confirmNewPassword } = req.body;

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!user.resetOtp || !user.resetOtpExpires) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        if (user.resetOtpExpires < Date.now()) {
            return res.status(400).json({
                message: "OTP expired"
            });
        }

        const incomingHash = hashOtp(otp);
        const storedLooksHashed = /^[a-f0-9]{64}$/i.test(user.resetOtp);
        const matches = storedLooksHashed
            ? safeCompareHex(user.resetOtp, incomingHash)
            : user.resetOtp === otp;

        if (!matches) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;
        await user.save();

        return res.status(200).json({
            message: "Password reset successfully."
        });
    } catch (err) {
        logger.error("resetPassword error", err);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function forgetPassword(req, res) {
    try {
        const { email } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(200).json({
                message: "OTP sent successfully."
            });
        }

        if (user.resetOtpExpires && user.resetOtp && Date.now() < new Date(user.resetOtpExpires).getTime() - (OTP_TTL_MS - OTP_RESEND_MS)) {
            return res.status(429).json({
                message: "Please wait before requesting another OTP"
            });
        }

        const otp = generateOtp();
        const html = getOtpHtml(otp);

        user.resetOtp = hashOtp(otp);
        user.resetOtpExpires = Date.now() + OTP_TTL_MS;
        await user.save();

        await sendEmail(
            user.email,
            "Reset Password OTP",
            "Your password reset OTP has been generated.",
            html
        );

        return res.status(200).json({
            message: "OTP sent successfully."
        });
    } catch (err) {
        logger.error("forgetPassword error", err);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function followUser(req, res) {
    try {
        const currentUserId = String(req.userId || req.auth?.id);
        const { id: targetUserId } = req.params;

        if (currentUserId === String(targetUserId)) {
            return res.status(400).json({
                message: "You cannot follow yourself"
            });
        }

        const targetUser = await userModel.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const currentUser = await userModel.findById(currentUserId);
        if (!currentUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const alreadyFollowing = currentUser.following.some(
            (id) => id.toString() === String(targetUserId)
        );

        if (alreadyFollowing) {
            return res.status(409).json({
                message: "You are already following this user"
            });
        }

        await userModel.findByIdAndUpdate(currentUserId, {
            $addToSet: { following: targetUserId }
        });

        await userModel.findByIdAndUpdate(targetUserId, {
            $addToSet: { follower: currentUserId }
        });

        return res.status(200).json({
            message: `You are now following ${targetUser.username}`
        });
    } catch (error) {
        logger.error("Follow Error", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function unfollowUser(req, res) {
    try {
        const currentUserId = String(req.userId || req.auth?.id);
        const { id: targetUserId } = req.params;

        if (currentUserId === String(targetUserId)) {
            return res.status(400).json({
                message: "You cannot unfollow yourself"
            });
        }

        const targetUser = await userModel.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await userModel.findByIdAndUpdate(currentUserId, {
            $pull: { following: targetUserId }
        });

        await userModel.findByIdAndUpdate(targetUserId, {
            $pull: { follower: currentUserId }
        });

        return res.status(200).json({
            message: `You have unfollowed ${targetUser.username}`
        });
    } catch (error) {
        logger.error("Unfollow Error", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function getFollowers(req, res) {
    try {
        const { id } = req.params;

        const user = await userModel
            .findById(id)
            .select("follower")
            .populate("follower", "username name email")
            .lean();

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            count: user.follower.length,
            followers: user.follower
        });
    } catch (error) {
        logger.error("Get Followers Error", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function getFollowing(req, res) {
    try {
        const { id } = req.params;

        const user = await userModel
            .findById(id)
            .select("following")
            .populate("following", "username name email")
            .lean();

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            count: user.following.length,
            following: user.following
        });
    } catch (error) {
        logger.error("Get Following Error", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function Loggout(req, res) {
    try {
        const token = req.cookies.token;

        if (token) {
            await tokenBlacklistModel.updateOne(
                { token },
                { $setOnInsert: { token } },
                { upsert: true }
            );
        }

        res.clearCookie("token", cookieOptions());

        return res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        logger.error("Logout Error", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

module.exports = {
    RegisterUser,
    LoginUser,
    Loggout,
    userotpVerfication,
    changePassword,
    resetPassword,
    forgetPassword,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
};
