const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const tokenBlacklistModel = require("../models/blacklist.model");
const logger = require("../utils/logger");
const { env } = require("../config/env");

async function verifyToken(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const blacklisted = await tokenBlacklistModel.findOne({ token }).select("_id").lean();
        if (blacklisted) {
            logger.warn("Authentication failure", { reason: "blacklisted_token" });
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const decoded = jwt.verify(token, env.JWT_KEY);
        const user = await userModel.findById(decoded.id).select("username name email role status");

        if (!user) {
            logger.warn("Authentication failure", { reason: "user_not_found" });
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const id = user._id.toString();
        req.auth = {
            id,
            email: user.email,
            username: user.username,
            role: user.role
        };
        req.user = {
            id,
            _id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role
        };
        req.userId = id;
        next();
    } catch (err) {
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            logger.warn("Authentication failure", { reason: err.name });
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        next(err);
    }
}

function verifyAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (res.headersSent) return;
        if (req.auth.role !== "chef") {
            return res.status(403).json({ message: "Admins only" });
        }
        next();
    });
}

function verifyUser(req, res, next) {
    verifyToken(req, res, () => {
        if (res.headersSent) return;
        if (req.auth.role !== "user") {
            return res.status(403).json({ message: "Users only" });
        }
        next();
    });
}

function requireRole(...roles) {
    return (req, res, next) => {
        verifyToken(req, res, () => {
            if (res.headersSent) return;
            if (!roles.includes(req.auth.role)) {
                return res.status(403).json({ message: "Forbidden" });
            }
            next();
        });
    };
}

module.exports = {
    verifyToken,
    verifyAdmin,
    verifyUser,
    requireRole,
    authenticateUser: verifyToken,
    authenticateFoodPartner: verifyAdmin
};
