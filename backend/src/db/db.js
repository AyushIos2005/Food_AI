const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { env } = require("../config/env");

mongoose.set("sanitizeFilter", true);
mongoose.set("strictQuery", true);

async function db() {
    mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
    });
    mongoose.connection.on("error", (error) => {
        logger.error("MongoDB connection error", error);
    });

    const retries = 5;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(env.MON_URI);
            logger.info("Successfully connected to DB");
            return;
        } catch (error) {
            logger.error("MongoDB connection failed", error, { attempt, retries });
            if (attempt === retries) {
                logger.error("Could not connect to MongoDB after retries");
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
    }
}

async function closeDb() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed");
    }
}

function isDbConnected() {
    return mongoose.connection.readyState === 1;
}

module.exports = db;
module.exports.closeDb = closeDb;
module.exports.isDbConnected = isDbConnected;
