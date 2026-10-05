const { env } = require("../config/env");

function cookieOptions() {
    const isProd = env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/"
    };
}

function signTokenPayload(jwt, payload) {
    return jwt.sign(payload, env.JWT_KEY, { expiresIn: env.JWT_EXPIRES_IN });
}

module.exports = { cookieOptions, signTokenPayload };
