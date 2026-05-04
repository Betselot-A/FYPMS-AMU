// ============================================================
// Global Settings Controller
// ============================================================

const Settings = require("../models/Settings");

/**
 * GET /api/settings
 */
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/settings
 * Admin only
 */
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    const allowedFields = [
      "systemName", "defaultPassword",
      "academicSemester", "academicYear",
      "allowProposals", "registrationDeadline",
      "smtpHost", "smtpPort", "smtpUser", "smtpPassword", "emailFrom"
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/settings/test-email
 * Admin only — Sends a test email to the current admin
 */
const testEmailConfiguration = async (req, res, next) => {
  try {
    const emailService = require("../utils/emailService");
    
    const result = await emailService.sendEmail({
      to: req.user.email,
      subject: "ProjectHub SMTP Test",
      message: "Congratulations! Your SMTP settings are correctly configured.",
      html: `<h3>SMTP Connection Successful</h3>
             <p>This is a test email from ProjectHub to confirm your mail server configuration is working.</p>`
    });

    if (result.success) {
      res.json({ message: "Test email sent successfully to " + req.user.email });
    } else {
      res.status(400).json({ 
        error: "SMTP_ERROR", 
        message: result.error || "Failed to send test email" 
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  testEmailConfiguration,
};
