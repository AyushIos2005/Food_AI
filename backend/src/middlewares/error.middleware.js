const logger = require("../utils/logger");
const AppError = require("../utils/AppError");
const multer = require("multer");

function notFoundHandler(req, res) {
    return res.status(404).json({
        message: "Route not found"
    });
}

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof multer.MulterError) {
        const message =
            err.code === "LIMIT_FILE_SIZE"
                ? "File is too large"
                : err.code === "LIMIT_FILE_COUNT"
                    ? "Too many files"
                    : "Upload failed";
        return res.status(400).json({ message, success: false });
    }

    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Malformed JSON" });
    }

    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({ message: "Origin not allowed" });
    }

    const status = err.statusCode || err.status || 500;
    const isProd = process.env.NODE_ENV === "production";
    const operational = err instanceof AppError || err.isOperational;

    logger.error("Request error", err, {
        path: req.originalUrl,
        method: req.method,
        status
    });

    const payload = {
        message: status >= 500 && isProd && !operational
            ? "Internal Server Error"
            : err.message || "Internal Server Error"
    };

    if (status === 422 || (status === 400 && err.details)) {
        payload.details = err.details;
    }

    if (!isProd && status >= 500) {
        payload.error = err.message;
    }

    return res.status(status).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
