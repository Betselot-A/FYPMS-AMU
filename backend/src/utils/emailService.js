// ============================================================
// Email Service Utility
// Handles SMTP configuration and sending emails
// ============================================================

const nodemailer = require("nodemailer");
const Settings = require("../models/Settings");

const emailService = {
  /**
   * Send an email using stored SMTP settings
   * @param {Object} options - { to, subject, text, html }
   */
  sendEmail: async ({ to, subject, text, html }) => {
    try {
      // 1. Fetch settings from database
      const settings = await Settings.findOne();
      
      if (!settings || !settings.smtpHost || !settings.smtpUser) {
        console.warn("Email Service: SMTP not configured. Skipping email.");
        return { success: false, message: "SMTP not configured" };
      }

      // 2. Create Transporter
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort,
        secure: settings.smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPassword,
        },
      });

      // 3. Define Mail Options
      const mailOptions = {
        from: `"${settings.systemName || "ProjectHub"}" <${settings.emailFrom}>`,
        to,
        subject,
        text,
        html,
      };

      // 4. Send Email
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent: %s", info.messageId);
      return { success: true, info };
    } catch (error) {
      console.error("Email Service Error:", error.message);
      return { success: false, error: error.message };
    }
  },
};

module.exports = emailService;
