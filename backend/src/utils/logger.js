const SENSITIVE = [
    "password",
    "oldpassword",
    "newpassword",
    "confirmnewpassword",
    "token",
    "otp",
    "resetotp",
    "authorization",
    "cookie",
    "apikey",
    "api_key",
    "privatekey",
    "secret",
    "clientsecret",
    "refreshtoken",
    "jwt"
];

function redact(value) {
    if (!value || typeof value !== "object") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(redact);
    }

    const clean = {};
    for (const [key, nested] of Object.entries(value)) {
        if (SENSITIVE.some((item) => key.toLowerCase().includes(item))) {
            clean[key] = "[REDACTED]";
        } else {
            clean[key] = redact(nested);
        }
    }
    return clean;
}

function serializeError(error) {
    if (!error) return "";
    if (typeof error === "string") return error;
    return error.message || "Unknown error";
}

function log(level, message, meta) {
    const payload = {
        level,
        time: new Date().toISOString(),
        message,
        ...(meta ? { meta: redact(meta) } : {})
    };

    const line = JSON.stringify(payload);
    if (level === "error") {
        console.error(line);
        return;
    }
    console.log(line);
}

module.exports = {
    info: (message, meta) => log("info", message, meta),
    warn: (message, meta) => log("warn", message, meta),
    error: (message, error, meta) =>
        log("error", message, { ...meta, error: serializeError(error), stack: process.env.NODE_ENV === "production" ? undefined : error?.stack }),
    redact
};
