// ============================================================
// Notification Utilities
// Centralized logic for triggering system alerts
// ============================================================

const Notification = require("../models/Notification");
const User = require("../models/User");
const emailService = require("./emailService");

const notificationUtils = {
  /**
   * Send a single notification to a user
   * @param {Object} params - { userId, message, type, senderId, subject }
   */
  sendNotification: async ({ userId, message, type = "info", senderId = null, subject = "" }) => {
    try {
      // 1. Create In-App Notification
      const notification = await Notification.create({
        userId,
        message,
        type,
        senderId,
        subject
      });

      // 2. Attempt to Send Email
      const user = await User.findById(userId);
      if (user && user.email) {
        await emailService.sendEmail({
          to: user.email,
          subject: subject || "ProjectHub Notification",
          text: message,
          html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                  <h2 style="color: #2563eb;">Notification</h2>
                  <p>${message}</p>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                  <small style="color: #666;">This is an automated message from ProjectHub.</small>
                 </div>`
        });
      }

      return notification;
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
