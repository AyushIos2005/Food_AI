const multer = require("multer");
const { mimeMatchesExtension, EXT_BY_MIME } = require("../utils/safeFilename");

const storage = multer.memoryStorage();

function makeFilter(allowedMimes) {
    return (req, file, cb) => {
        if (!allowedMimes.includes(file.mimetype) || !mimeMatchesExtension(file)) {
            return cb(new Error("Invalid or unsupported file type"), false);
        }
        cb(null, true);
    };
}

const foodUpload = multer({
    storage,
    limits: {
        files: 1,
        fileSize: 8 * 1024 * 1024
    },
    fileFilter: makeFilter(["image/jpeg", "image/jpg", "image/png", "image/webp"])
});

const mediaUpload = multer({
    storage,
    limits: {
        files: 10,
        fileSize: 50 * 1024 * 1024
    },
    fileFilter: makeFilter(Object.keys(EXT_BY_MIME))
});

module.exports = { foodUpload, mediaUpload };
