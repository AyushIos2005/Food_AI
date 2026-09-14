const { ImageKit } = require("@imagekit/nodejs");
const { env } = require("../config/env");
const { safeFilename } = require("../utils/safeFilename");
const logger = require("../utils/logger");

const ImageKitClient = new ImageKit({
    privateKey: env.IMAGE_PRIVATE_KEY
});

async function uploadFile(file, originalFile) {
    try {
        const fileName = originalFile
            ? safeFilename(originalFile, "food")
            : `food_${Date.now()}`;

        const result = await ImageKitClient.files.upload({
            file,
            fileName,
            folder: env.IMAGEKIT_FOLDER
        });

        return result;
    } catch (error) {
        logger.error("ImageKit upload failed", error);
        throw new Error("File upload failed");
    }
}

module.exports = { uploadFile };
