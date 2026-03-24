const Grade = require("../models/Grade");

// Create grade
exports.createGrade = async (data) => {
    return await Grade.create(data);
};

// Get grades by project
exports.getGradesByProject = async (projectId) => {
    return await Grade.find({ projectId }).populate("evaluatorId", "name email");
};

// Calculate total
exports.calculateTotal = (marks) => {
    return marks.reduce((sum, m) => sum + (m.mark || 0), 0);
};
