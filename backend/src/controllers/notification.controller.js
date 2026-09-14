const Notification = require("../models/notification.model");

async function getNotifications(req, res, next) {
  try {
    const userId = req.user._id;

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Number(req.query.limit) || 20,
      50
    );

    const skip = (page - 1) * limit;

    const notifications =
      await Notification.find({
        recipient: userId,
      })
        .populate("sender", "username profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const unreadCount =
      await Notification.countDocuments({
        recipient: userId,
        isRead: false,
      });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        hasMore: notifications.length === limit,
      },
    });
  } catch (error) {
    next(error);
  }
}


async function markAsRead(req, res, next) {
  try {
    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          recipient: req.user._id,
        },
        {
          isRead: true,
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}


async function markAllAsRead(req, res, next) {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {getNotifications,markAsRead,markAllAsRead};