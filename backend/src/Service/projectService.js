const Project = require("../models/Project");

// Create project
exports.createProject = async (data) => {
    return await Project.create(data);
};

// Get all projects
exports.getAllProjects = async () => {
    return await Project.find()
        .populate("groupMembers", "name email")
        .populate("advisorId", "name email")
        .populate("examinerId", "name email");
};

// Get single project
exports.getProjectById = async (id) => {
    return await Project.findById(id);
};

// Update project
exports.updateProject = async (id, data) => {
    return await Project.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
};

// Delete project
exports.deleteProject = async (id) => {
    return await Project.findByIdAndDelete(id);
};
