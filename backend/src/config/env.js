require("dotenv").config();

const REQUIRED = ["MON_URI", "JWT_KEY"];

function firstDefined(...values) {
    return values.find((value) => value !== undefined && value !== "" && value !== null);
}

const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT) || 3000,
    MON_URI: firstDefined(process.env.MON_URI, process.env.MONGO_URI),
    JWT_KEY: process.env.JWT_KEY,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
    COOKIE_SAMESITE: process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === "production" ? "strict" : "lax"),
    TRUST_PROXY: process.env.TRUST_PROXY === "true",
    IMAGE_PRIVATE_KEY: firstDefined(process.env.IMAGE_PRIVATE_KEY, process.env.IMG_PRIVATE_KEY),
    IMAGEKIT_FOLDER: process.env.IMAGEKIT_FOLDER || "yt-complete-backend/music",
    GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    AI_MAX_RETRIES: Number(process.env.AI_MAX_RETRIES) || 3,
    AI_RETRY_DELAY: Number(process.env.AI_RETRY_DELAY) || 2000,
    AI_TIMEOUT_MS: Number(process.env.AI_TIMEOUT_MS) || 45000,
    GOOGLE_USER: process.env.GOOGLE_USER,
    BODY_LIMIT: process.env.BODY_LIMIT || "256kb"
};

function assertEnv() {
    const missing = REQUIRED.filter((key) => !env[key] && !process.env[key]);
    if (!env.MON_URI) missing.push("MON_URI");
    if (!env.JWT_KEY) missing.push("JWT_KEY");
    const unique = [...new Set(missing)];
    if (unique.length) {
        throw new Error(`Missing required environment variables: ${unique.join(", ")}`);
    }
}

module.exports = { env, assertEnv };
