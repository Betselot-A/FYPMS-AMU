// ============================================================
// ProjectHub Evaluation & Grading System
// ============================================================

const Grade = require("../models/Grade");
const Project = require("../models/Project");
const Notification = require("../models/Notification");

/**
 * POST /api/evaluations
 * Staff — submit evaluation marks for a student in a project
 */
const submitEvaluation = async (req, res, next) => {
  try {
    const { projectId, studentId, phaseId, marks, comments } = req.body;

    if (!studentId) {
       return res.status(400).json({ message: "Student ID is required for marking." });
    }

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

    // Upsert logic: Update if exists, else create
    const grade = await Grade.findOneAndUpdate(
      { 
        projectId, 
        studentId, 
        phaseId: phaseId || "general", 
        evaluatorId: req.user._id 
      },
      {
        marks,
        totalMark,
        comments: comments || "",
      },
      { new: true, upsert: true }
    );

    // Notify student
    await Notification.create({
      userId: studentId,
      message: `You have received a new evaluation in "${project.title}" (${phaseId || "General"})`,
      type: "success",
    });

    res.status(201).json(grade);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/evaluations/:projectId
 * Get all evaluations for a project (populated with student & evaluator)
 */
const getEvaluationsByProject = async (req, res, next) => {
  try {
    const grades = await Grade.find({ projectId: req.params.projectId })
      .populate("evaluatorId", "name email")
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.json(grades);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/evaluations/results/:projectId
 * Get aggregated results (Legacy helper, frontend now handles complex aggregation)
 */
const getProjectResults = async (req, res, next) => {
  try {
    const grades = await Grade.find({ projectId: req.params.projectId })
      .populate("evaluatorId", "name email")
      .populate("studentId", "name email");

    res.json({
      phases: grades,
      message: "Aggregation should be handled by frontend based on config weights."
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
