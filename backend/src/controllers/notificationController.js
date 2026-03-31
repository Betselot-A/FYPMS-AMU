// ============================================================
// ProjectHub Notification & Announcement System
// ============================================================

const Notification = require("../models/Notification");
const User = require("../models/User");

/**
 * GET /api/notifications
 * Authenticated — get current user's notifications (inbox)
 */
const getNotifications = async (req, res, next) => {
  try {
    // Fetch messages where user is either recipient OR sender
    const notifications = await Notification.find({
      $or: [{ userId: req.user._id }, { senderId: req.user._id }]
    })
      .populate("senderId", "name role")
      .populate("userId", "name role")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/sent
 * Admin/Coordinator — get messages they sent
 */
const getSentNotifications = async (req, res, next) => {
  try {
    const sent = await Notification.find({ senderId: req.user._id })
      .populate("userId", "name email role department")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(sent);
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
 * Mark all of current user's notifications as read
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
 * Admin/Coordinator — send a notification to a specific user or all users
 * Body: { userId?, userIds?, subject?, message, type? }
 *   - userId: single target user
 *   - userIds: array of target user IDs
 *   - If neither provided: broadcast to all non-admin users
 */
const createNotification = async (req, res, next) => {
  try {
    const { userId, userIds, subject, message, type } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "VALIDATION", message: "Message is required" });
    }

    const isAdminOrCoordinator = ["admin", "coordinator"].includes(req.user.role);
    let targets = [];

    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      targets = userIds;
    } else if (userId) {
      targets = [userId];
    } else if (!isAdminOrCoordinator) {
      // Students/Staff trying to broadcast
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "You are not authorized to broadcast messages to all users.",
      });
    } else {
      // Broadcast to all non-admin users (excluding sender) — ONLY for Admin/Coordinator
      const nonAdmins = await User.find({ 
        role: { $ne: "admin" },
        _id: { $ne: req.user._id }
      }).select("_id");
      targets = nonAdmins.map((u) => u._id.toString());
    }

    // Ensure the sender is never in the target list (even if manually added)
    targets = targets.filter((uid) => uid !== req.user._id.toString());

    const notifications = targets.map((uid) => ({
      userId: uid,
      senderId: req.user._id,
      subject: subject || "",
      message: message.trim(),
      type: type || "info",
    }));

    const created = await Notification.insertMany(notifications);
    res.status(201).json({ sent: created.length, notifications: created });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getSentNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
};
