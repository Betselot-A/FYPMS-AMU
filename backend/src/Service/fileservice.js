const File = require("../models/File");

// Save file info
exports.saveFile = async (data) => {
    return await File.create(data);
};

// Get files by user
exports.getUserFiles = async (userId) => {
    return await File.find({ uploadedBy: userId });
};
