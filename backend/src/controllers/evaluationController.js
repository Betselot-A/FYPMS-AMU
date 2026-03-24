// ============================================================
// ProjectHub Evaluation & Grading System
// ============================================================

const Grade = require("../models/Grade");
const Project = require("../models/Project");
const Notification = require("../models/Notification");

/**
 * POST /api/evaluations
 * Staff — submit evaluation marks for a project
 */
const submitEvaluation = async (req, res, next) => {
  try {
    const { projectId, phaseId, marks, comments } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Project not found",
      });
    }

    // Calculate total mark
    const totalMark = marks.reduce((sum, m) => sum + (m.mark || 0), 0);

    const grade = await Grade.create({
      projectId,
      evaluatorId: req.user._id,
      phaseId: phaseId || "general",
      marks,
      totalMark,
      comments: comments || "",
    });

    // Notify project members
    const notifications = project.groupMembers.map((memberId) => ({
      userId: memberId,
      message: `Your project "${project.title}" has been evaluated`,
      type: "success",
    }));
    await Notification.insertMany(notifications);

    res.status(201).json(grade);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/evaluations/:projectId
 * Get all evaluations for a project
 */
const getEvaluationsByProject = async (req, res, next) => {
  try {
    const grades = await Grade.find({ projectId: req.params.projectId })
      .populate("evaluatorId", "name email")
      .sort({ createdAt: -1 });

    res.json(grades);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/evaluations/results/:projectId
 * Get aggregated results for a project
 */
const getProjectResults = async (req, res, next) => {
  try {
    const grades = await Grade.find({ projectId: req.params.projectId })
      .populate("evaluatorId", "name email");

    const totalPercentage =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + g.totalMark, 0) / grades.length
        : 0;

    // Simple grade calculation
    let finalGrade = "F";
    if (totalPercentage >= 90) finalGrade = "A+";
    else if (totalPercentage >= 80) finalGrade = "A";
    else if (totalPercentage >= 70) finalGrade = "B+";
    else if (totalPercentage >= 60) finalGrade = "B";
    else if (totalPercentage >= 50) finalGrade = "C";
    else if (totalPercentage >= 40) finalGrade = "D";

    res.json({
      phases: grades,
      totalPercentage: Math.round(totalPercentage * 100) / 100,
      finalGrade,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitEvaluation,
  getEvaluationsByProject,
  getProjectResults,
};
