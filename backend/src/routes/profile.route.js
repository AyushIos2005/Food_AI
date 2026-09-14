const express = require("express");
const profile = express.Router();
const profileController = require("../controllers/profile.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { profileSchema, idParamSchema } = require("../validators/schemas");

profile.post("/create-profile", authMiddleware.verifyToken, validate(profileSchema), profileController.createProfile);
profile.patch("/upadate_profile/:id", authMiddleware.verifyToken, validate(idParamSchema, "params"), validate(profileSchema), profileController.updateProfile);
profile.delete("/delete_profile/:id", authMiddleware.verifyToken, validate(idParamSchema, "params"), profileController.deleteProfile);
profile.post("/delete_profile/:id", authMiddleware.verifyToken, validate(idParamSchema, "params"), profileController.deleteProfile);
profile.get("/get_detail", authMiddleware.verifyToken, profileController.getProfile);

module.exports = profile;
