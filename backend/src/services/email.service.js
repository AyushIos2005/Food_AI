const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.GOOGLE_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    }
});

if (process.env.GOOGLE_USER) {
    transporter.verify((error) => {
        if (error) {
            logger.error("Error connecting in email sender", error);
        } else {
            logger.info("Email server is ready to send message");
        }
    });
}

const sendEmail = async (to, subject, text, html) => {
    try {
        await transporter.sendMail({
            from: `FoodAI <${process.env.GOOGLE_USER}>`,
            to,
            subject,
            text,
            html
        });
    } catch (err) {
        logger.error("Error in sending mail", err);
    }
};

module.exports = sendEmail;
