const feedbackModel = require("../models/feedback.model");
const complainModel = require("../models/complain.model");
const contactModel = require("../models/contact.model");
const userModel = require("../models/user.model");
const sendEmail = require("../services/email.service");
const bcrypt = require("bcryptjs");
const { getContactDeveloperHtml } = require("../utils/util");
const logger = require("../utils/logger");

function getAuthUserId(req) {
    return req.userId || req.auth?.id;
}

async function giveFeedback(req, res) {
    const userId = getAuthUserId(req);
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: Token not found" });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { rating } = req.body;
        if (rating === undefined || rating === null) {
            return res.status(400).json({
                message: "Rating in number"
            });
        }

        const feedback = await feedbackModel.create({
            user: userId,
            rating
        });

        return res.status(200).json({
            message: "Thank you for your feedback",
            feedback
        });
    } catch (err) {
        logger.error("Feedback error", err);
        return res.status(500).json({
            message: "Error giving feedback"
        });
    }
}

async function complain(req, res) {
    const userId = getAuthUserId(req);
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: Token not found" });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { complainMessage } = req.body;
        if (!complainMessage) {
            return res.status(400).json({
                message: "Feedback Message is Required"
            });
        }

        const complainDoc = await complainModel.create({
            user: userId,
            complainMessage
        });

        return res.status(201).json({
            message: "Complain Registered Succefully",
            complain: complainDoc
        });
    } catch (err) {
        logger.error("Complain error", err);
        return res.status(500).json({
            message: "Error giving complain"
        });
    }
}

async function contactDeveloper(req, res) {
    const userId = getAuthUserId(req);
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: Token not found" });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { fullname, address, contactno, email, reason } = req.body;
        if (!fullname || !address || !contactno || !email || !reason) {
            return res.status(400).json({
                message: "Please provide requirement in correct manner"
            });
        }

        const hash1 = await bcrypt.hash(String(contactno), 10);
        const hash2 = await bcrypt.hash(String(email), 10);
        const contact = await contactModel.create({
            user: userId,
            fullname,
            address,
            contactno: hash1,
            email: hash2,
            reason
        });

        const html = getContactDeveloperHtml({ fullname, address, contactno, email, reason, userId });
        await sendEmail(
            process.env.GOOGLE_USER,
            `New Contact Developer Request - ${fullname}`,
            `New Contact Developer Request Name: ${fullname} Address: ${address} Contact Number: ${contactno} Email: ${email} Reason: ${reason} User ID: ${userId}`,
            html
        );

        return res.status(200).json({
            message: "Form submitted successfully and email sent",
            contactId: contact._id
        });
    } catch (err) {
        logger.error("Contact Developer Error", err);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

module.exports = { giveFeedback, complain, contactDeveloper };
