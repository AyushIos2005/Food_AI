require("dotenv").config();
const { assertEnv, env } = require("./src/config/env");
const logger = require("./src/utils/logger");

assertEnv();

const app = require("./src/app");
const db = require("./src/db/db");
const { closeDb } = require("./src/db/db");

db();

const server = app.listen(env.PORT, () => {
    logger.info(`Server is running on port ${env.PORT}`);
});

function shutdown(signal) {
    logger.info("Shutdown signal received", { signal });
    server.close(async () => {
        try {
            await closeDb();
        } catch (error) {
            logger.error("Error closing database", error);
        }
        process.exit(0);
    });

    setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("uncaughtException", (error) => {
    logger.error("uncaughtException", error);
    shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
    logger.error("unhandledRejection", reason instanceof Error ? reason : new Error(String(reason)));
});
