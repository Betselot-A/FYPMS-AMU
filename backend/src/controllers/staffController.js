// ============================================================
// ProjectHub Staff & Assignment System
// ============================================================

const Project = require("../models/Project");

/**
 * GET /api/staff/advising-projects
 * Staff — get projects where current user is advisor
 */
const getAdvisingProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ advisorId: req.user._id })
      .populate("groupMembers", "name email")
      .populate("advisorId", "name email")
      .populate("examinerId", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/examining-projects
 * Staff — get projects where current user is examiner
 */
const getExaminingProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ examinerId: req.user._id })
      .populate("groupMembers", "name email")
      .populate("advisorId", "name email")
      .populate("examinerId", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdvisingProjects,
  getExaminingProjects,
};
