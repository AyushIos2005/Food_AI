const path = require("path");
const crypto = require("crypto");

const EXT_BY_MIME = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov"
};

function extensionFor(file) {
    const fromMime = EXT_BY_MIME[file.mimetype];
    const fromName = path.extname(file.originalname || "").toLowerCase();
    if (fromMime) return fromMime;
    if (Object.values(EXT_BY_MIME).includes(fromName)) return fromName;
    return "";
}

function mimeMatchesExtension(file) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (!ext) return true;
    const expected = EXT_BY_MIME[file.mimetype];
    if (!expected) return false;
    if (file.mimetype === "image/jpeg" && (ext === ".jpg" || ext === ".jpeg")) return true;
    return ext === expected;
}

function safeFilename(file, prefix = "file") {
    const ext = extensionFor(file) || ".bin";
    return `${prefix}-${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
}

module.exports = { safeFilename, mimeMatchesExtension, EXT_BY_MIME };
