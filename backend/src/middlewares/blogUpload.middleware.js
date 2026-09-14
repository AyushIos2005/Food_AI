const multer = require("multer");
const ImageKit = require("@imagekit/nodejs");
const { toFile } = require("@imagekit/nodejs");
const { mediaUpload } = require("./upload.middleware");
const { safeFilename } = require("../utils/safeFilename");
const logger = require("../utils/logger");
const { env } = require("../config/env");

const imagekit = new ImageKit({
    privateKey: env.IMAGE_PRIVATE_KEY
});

const blogMediaUpload = async (req, res, next) => {
    try {
        await new Promise((resolve, reject) => {
            mediaUpload.array("media", 10)(req, res, (error) => {
                if (error) return reject(error);
                resolve();
            });
        });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one image or video"
            });
        }

        const uploadedMedia = await Promise.all(
            req.files.map(async (file) => {
                const isVideo = file.mimetype.startsWith("video/");
                const folder = isVideo ? "/blogs/videos" : "/blogs/images";
                const fileName = safeFilename(file, "blog");

                const result = await imagekit.files.upload({
                    file: await toFile(file.buffer, fileName),
                    fileName,
                    folder
                });

                return {
                    url: result.url,
                    type: isVideo ? "video" : "image"
                };
            })
        );

        req.body.media = uploadedMedia;
        next();
    } catch (error) {
        logger.error("Blog Media Upload Error", error);

        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    message: "File size cannot exceed 50 MB"
                });
            }
            if (error.code === "LIMIT_FILE_COUNT") {
                return res.status(400).json({
                    success: false,
                    message: "Maximum 10 files are allowed"
                });
            }
        }

        return res.status(400).json({
            success: false,
            message: error.message && !String(error.message).includes("key")
                ? error.message
                : "Media upload failed"
        });
    }
};

module.exports = {
    blogMediaUpload
};
