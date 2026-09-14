const DANGEROUS = new Set(["__proto__", "constructor", "prototype"]);

function isDangerousKey(key) {
    return DANGEROUS.has(key) || key.startsWith("$") || key.includes(".");
}

function sanitizeValue(value) {
    if (!value || typeof value !== "object") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }

    const clean = Object.create(null);
    for (const [key, nested] of Object.entries(value)) {
        if (isDangerousKey(key)) {
            continue;
        }
        clean[key] = sanitizeValue(nested);
    }
    return clean;
}

function replaceInPlace(target, clean) {
    if (!target || typeof target !== "object" || Array.isArray(target)) {
        return clean;
    }
    for (const key of Object.keys(target)) {
        delete target[key];
    }
    Object.assign(target, clean);
    return target;
}

function sanitizeRequest(req, res, next) {
    if (req.body && typeof req.body === "object") {
        replaceInPlace(req.body, sanitizeValue(req.body));
    }

    if (req.params && typeof req.params === "object") {
        replaceInPlace(req.params, sanitizeValue(req.params));
    }

    if (req.query && typeof req.query === "object") {
        try {
            replaceInPlace(req.query, sanitizeValue(req.query));
        } catch {
            req.sanitizedQuery = sanitizeValue({ ...req.query });
        }
    }

    next();
}

module.exports = { sanitizeRequest, sanitizeValue };
