const Notification = require("../models/notification.model");

async function createNotification({
  recipient,
  sender = null,
  type,
  title,
  message,
  entityId = null,
  entityType = null,
}) {
  if (
    !recipient ||
    !type ||
    !title ||
    !message
  ) {
    return null;
  }

  // Don't notify yourself
  if (
    sender &&
    recipient.toString() === sender.toString()
  ) {
    return null;
  }

  return await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    entityId,
    entityType,
  });
}

module.exports = {
  createNotification,
};