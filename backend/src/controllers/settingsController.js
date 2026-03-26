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

module.exports = {
  getSettings,
  updateSettings,
};
