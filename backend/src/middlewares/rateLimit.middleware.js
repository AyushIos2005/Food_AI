const { rateLimit } = require("express-rate-limit");

function createLimiter({ windowMs, limit, message }) {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                message: message || "Too many requests, please try again later"
            });
        }
    });
}

const apiLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    message: "Too many requests, please slow down"
});

const loginLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: "Too many login attempts, please try again later"
});

const registerLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    message: "Too many registration attempts, please try again later"
});

const otpLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: "Too many OTP requests, please try again later"
});

const passwordResetLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: "Too many password reset attempts, please try again later"
});

const aiLimiter = createLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    message: "AI usage limit reached, please try again later"
});

const uploadLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    message: "Too many uploads, please try again later"
});

module.exports = {
    apiLimiter,
    loginLimiter,
    registerLimiter,
    otpLimiter,
    passwordResetLimiter,
    aiLimiter,
    uploadLimiter
};
