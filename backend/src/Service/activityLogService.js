const ActivityLog = require("../models/ActivityLog");

// Log action
exports.logActivity = async (data) => {
    return await ActivityLog.create(data);
};

// Get logs
exports.getLogs = async () => {
    return await ActivityLog.find().sort({ createdAt: -1 });
};
