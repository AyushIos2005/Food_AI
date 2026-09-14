const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const userModel = require("../models/user.model");
const tokenBlacklistModel = require("../models/blacklist.model");
const { env } = require("../config/env");
const logger = require("../utils/logger");

let io;

function getCookieValue(cookieHeader, name) {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(";");

    for (const cookie of cookies) {
        const [key, ...valueParts] = cookie.trim().split("=");

        if (key === name) {
            return decodeURIComponent(valueParts.join("="));
        }
    }

    return null;
}

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
    });

    /*
     * ==========================================
     * SOCKET AUTHENTICATION
     * ==========================================
     */

    io.use(async (socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie;

            const token = getCookieValue(cookieHeader, "token");

            if (!token) {
                return next(new Error("Unauthorized"));
            }

            // Check blacklist
            const blacklisted = await tokenBlacklistModel
                .findOne({ token })
                .select("_id")
                .lean();

            if (blacklisted) {
                logger.warn("Socket authentication failure", {
                    reason: "blacklisted_token",
                });

                return next(new Error("Invalid or expired token"));
            }

            // Verify JWT
            const decoded = jwt.verify(token, env.JWT_KEY);

            // Verify user still exists
            const user = await userModel
                .findById(decoded.id)
                .select("_id username name email role status")
                .lean();

            if (!user) {
                logger.warn("Socket authentication failure", {
                    reason: "user_not_found",
                });

                return next(new Error("Invalid or expired token"));
            }

            /*
             * Store authenticated user data on socket.
             *
             * NEVER take userId from frontend.
             */
            socket.data.userId = user._id.toString();
            socket.data.user = {
                id: user._id.toString(),
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
            };

            next();
        } catch (error) {
            if (
                error.name === "JsonWebTokenError" ||
                error.name === "TokenExpiredError"
            ) {
                logger.warn("Socket authentication failure", {
                    reason: error.name,
                });

                return next(new Error("Invalid or expired token"));
            }

            logger.error("Socket authentication error", error);

            next(new Error("Socket authentication failed"));
        }
    });

    /*
     * ==========================================
     * CONNECTION
     * ==========================================
     */

    io.on("connection", (socket) => {
        const userId = socket.data.userId;

        /*
         * User ID comes ONLY from verified JWT.
         */
        socket.join(`user:${userId}`);

        logger.info("Socket connected", {
            socketId: socket.id,
            userId,
        });

        socket.on("disconnect", (reason) => {
            logger.info("Socket disconnected", {
                socketId: socket.id,
                userId,
                reason,
            });
        });
    });

    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
}

module.exports = {
    initSocket,
    getIO,
};