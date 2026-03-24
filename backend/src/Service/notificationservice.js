const Notification = require("../models/Notification");

// Create notification
exports.createNotification = async (data) => {
    return await Notification.create(data);
};

// Get user notifications
exports.getUserNotifications = async (userId) => {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
};

// Mark as read
exports.markAsRead = async (id) => {
    return await Notification.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
    );
};
