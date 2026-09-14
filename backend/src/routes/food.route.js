const express = require("express");
const foodController = require("../controllers/food.controller");
const authMiddleware = require("../middlewares/auth.middleware.js");
const { foodUpload } = require("../middlewares/upload.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { idParamSchema, paginationQuerySchema, foodBodySchema } = require("../validators/schemas");
const { uploadLimiter } = require("../middlewares/rateLimit.middleware");

const food = express.Router();

food.post(
    "/upload",
    authMiddleware.verifyAdmin,
    uploadLimiter,
    foodUpload.single("foodImage"),
    validate(foodBodySchema),
    foodController.createFood
);
food.delete("/deletefood/:id", authMiddleware.verifyAdmin, validate(idParamSchema, "params"), foodController.deleteFood);
food.get("/get", authMiddleware.verifyAdmin, validate(paginationQuerySchema, "query"), foodController.getFood);
food.get("/get-all", authMiddleware.verifyToken, validate(paginationQuerySchema, "query"), foodController.getFood);

module.exports = food;
