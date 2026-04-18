// ============================================================
// Notification Utilities
// Centralized logic for triggering system alerts
// ============================================================

const Notification = require("../models/Notification");

const notificationUtils = {
  /**
   * Send a single notification to a user
   * @param {Object} params - { userId, message, type, senderId, subject }
   */
  sendNotification: async ({ userId, message, type = "info", senderId = null, subject = "" }) => {
    try {
      return await Notification.create({
        userId,
        message,
        type,
        senderId,
        subject
      });
    } catch (error) {
      console.error("Notification Utility Error (Single):", error.message);
      return null;
    }
  },

  /**
   * Send notifications to multiple users at once
   * @param {Object} params - { userIds, message, type, senderId, subject }
   */
  sendBulkNotifications: async ({ userIds, message, type = "info", senderId = null, subject = "" }) => {
    try {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) return [];
      
      const notifications = userIds.map(uid => ({
        userId: uid,
        message,
        type,
        senderId,
        subject
      }));

      return await Notification.insertMany(notifications);
    } catch (error) {
      console.error("Notification Utility Error (Bulk):", error.message);
      return [];
    }
  }
};

module.exports = notificationUtils;
