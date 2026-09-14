const express = require("express");
const authMiddlewares = require("../middlewares/auth.middleware");
const amzeController = require("../controllers/amze.controller");
const { validate } = require("../middlewares/validate.middleware");
const { proteinSchema, recreateSchema, idParamSchema } = require("../validators/schemas");
const { aiLimiter } = require("../middlewares/rateLimit.middleware");

const amze = express.Router();

amze.post("/amzingFood", authMiddlewares.verifyToken, aiLimiter, validate(proteinSchema), amzeController.CreateFood);
amze.get("/getamzefood", authMiddlewares.verifyToken, amzeController.GetFood);
amze.post("/amzeFood/recreate", authMiddlewares.verifyToken, aiLimiter, validate(recreateSchema), amzeController.ReCreateExisting);
amze.get("/amzeFood/getrecreate", authMiddlewares.verifyToken, amzeController.GetReCreateExisting);
amze.get("/amzeFood/history", authMiddlewares.verifyToken, amzeController.GetMyHistory);
amze.get("/amzeFood/history/:id", authMiddlewares.verifyToken, validate(idParamSchema, "params"), amzeController.GetMyHistoryById);
amze.delete("/amze/history/:id", authMiddlewares.verifyToken, validate(idParamSchema, "params"), amzeController.DeleteMyHistory);
amze.delete("/amze/history", authMiddlewares.verifyToken, amzeController.DeleteAllMyHistory);
amze.patch("/amze/history/:id/undo", authMiddlewares.verifyToken, validate(idParamSchema, "params"), amzeController.UndoMyHistory);

module.exports = amze;
