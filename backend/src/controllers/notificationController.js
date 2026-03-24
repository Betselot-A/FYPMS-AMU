// ============================================================
// ProjectHub Notification & Announcement System
// ============================================================

const Notification = require("../models/Notification");

/**
 * GET /api/notifications
 * Authenticated — get current user's notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Notification not found",
      });
    }

    res.json({ message: "Marked as read" });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: "All marked as read" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/notifications
 * Admin — send notification to user(s)
 */
const createNotification = async (req, res, next) => {
  try {
    const { userId, userIds, message, type } = req.body;

    // Support single or bulk notifications
    const targets = userIds || [userId];
    const notifications = targets.map((uid) => ({
      userId: uid,
      message,
      type: type || "info",
    }));

    const created = await Notification.insertMany(notifications);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
};
