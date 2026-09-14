const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const feedbackController = require("../controllers/feedback.controller");
const { validate } = require("../middlewares/validate.middleware");
const { feedbackSchema, complainSchema, contactSchema } = require("../validators/schemas");

const feedback = express.Router();

feedback.post("/feedback", authMiddleware.verifyToken, validate(feedbackSchema), feedbackController.giveFeedback);
feedback.post("/complain", authMiddleware.verifyUser, validate(complainSchema), feedbackController.complain);
feedback.post("/contact-developer", authMiddleware.verifyToken, validate(contactSchema), feedbackController.contactDeveloper);

module.exports = feedback;
