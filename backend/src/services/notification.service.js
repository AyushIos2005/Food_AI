const Notification = require("../models/notification.model");
const { getIO } = require("../socket.io/socket");

async function createNotification({
    recipient,
    sender = null,
    type,
    title,
    message,
    entityId = null,
    entityType = null,
}) {
    if (!recipient || !type || !title || !message) {
        return null;
    }

    // Don't notify yourself
    if (
        sender &&
        recipient.toString() === sender.toString()
    ) {
        return null;
    }

    // Save notification FIRST
    const notification = await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        entityId,
        entityType,
    });

    /*
     * ==========================================
     * REAL-TIME NOTIFICATION
     * ==========================================
     */

    try {
        const io = getIO();

        io.to(`user:${recipient.toString()}`).emit(
            "notification:new",
            notification
        );
    } catch (error) {
        /*
         * Socket failure should NOT make
         * successful notification creation fail.
         */
        console.error(
            "Real-time notification emit failed:",
            error.message
        );
    }

    return notification;
}

module.exports = {
    createNotification,
};