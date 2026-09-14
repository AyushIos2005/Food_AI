const foodModel = require("../models/postfood.model");
const { uploadFile } = require("../services/storage.service");
const logger = require("../utils/logger");
const { getPagination } = require("../utils/pagination");

function parseIngredients(ingredients) {
    if (Array.isArray(ingredients)) {
        return ingredients.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof ingredients !== "string") {
        return [];
    }
    const trimmed = ingredients.trim();
    if (!trimmed) return [];
    try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
    } catch {
        // comma-separated fallback
    }
    return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
}

async function createFood(req, res) {
    try {
        const decoded = req.auth;
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (decoded.role !== "chef") {
            return res.status(403).json({
                message: "You don't have access to create a food post"
            });
        }

        const { foodName, ingredients, precautions, description } = req.body;
        const foodImage = req.file;

        if (!foodImage) {
            return res.status(400).json({
                message: "Food image is required"
            });
        }

        const parsedIngredients = parseIngredients(ingredients);
        if (!parsedIngredients.length) {
            return res.status(400).json({
                message: "Ingredients are required"
            });
        }

        const result = await uploadFile(
            foodImage.buffer.toString("base64"),
            foodImage
        );

        const food = await foodModel.create({
            foodImage: result.url,
            foodName,
            ingredients: parsedIngredients,
            precautions,
            description,
            chef: decoded.id
        });

        return res.status(201).json({
            message: "Food is created successfully",
            food
        });
    } catch (err) {
        logger.error("Create Food Error", err);
        return res.status(500).json({
            message: "Error creating food"
        });
    }
}

async function deleteFood(req, res) {
    try {
        const decoded = req.auth;
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (decoded.role !== "chef") {
            return res.status(403).json({
                message: "You don't have access to delete a food post"
            });
        }

        const { id } = req.params;
        const food = await foodModel.findById(id);

        if (!food) {
            return res.status(404).json({
                message: "Food Not Found!!"
            });
        }

        const ownerId = (food.chef || food.user)?.toString();
        if (ownerId !== String(decoded.id)) {
            return res.status(403).json({
                message: "You are not allowed to delete this food"
            });
        }

        await foodModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Food deleted successfully"
        });
    } catch (err) {
        logger.error("Delete Food Error", err);
        return res.status(500).json({
            message: "Error deleting food"
        });
    }
}

async function getFood(req, res) {
    try {
        if (!req.auth) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { page, limit, skip, paginate } = getPagination(req.validatedQuery || req.query);
        const search = (req.validatedQuery || req.query).search;

        const filter = {};
        if (search) {
            filter.foodName = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
        }

        let query = foodModel.find(filter).populate("chef", "username").sort({ createdAt: -1 }).lean();

        if (paginate) {
            query = query.skip(skip).limit(limit);
        }

        const foods = await query;
        return res.status(200).json({
            message: "All Dishes Fetched Succefully",
            foods
        });
    } catch (err) {
        logger.error("Get Food Error", err);
        return res.status(500).json({
            message: "Error fetching food"
        });
    }
}

module.exports = {
    createFood,
    deleteFood,
    getFood
};
