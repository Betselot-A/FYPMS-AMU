// ============================================================
// ProjectHub Project Submission & Feedback System
// ============================================================

const Submission = require("../models/Submission");
const Project = require("../models/Project");
const Notification = require("../models/Notification");

/**
 * GET /api/submissions/:projectId
 * Get all submissions for a project
 */
const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ projectId: req.params.projectId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/submissions
 * Student — create a new submission with file uploads
 */
const createSubmission = async (req, res, next) => {
  try {
    const { projectId, title } = req.body;

    // Verify student belongs to project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Project not found",
      });
    }

    const isMember = project.groupMembers.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "You are not a member of this project",
      });
    }

    // Collect uploaded file paths
    const files = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    const submission = await Submission.create({
      projectId,
      userId: req.user._id,
      title,
      files,
    });

    // Notify advisor
    if (project.advisorId) {
      await Notification.create({
        userId: project.advisorId,
        message: `New submission "${title}" uploaded for project "${project.title}"`,
        type: "info",
      });
    }

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/submissions/:submissionId/feedback
 * Staff — add feedback to a submission
 */
const addFeedback = async (req, res, next) => {
  try {
    const { message } = req.body;
    const submission = await Submission.findById(req.params.submissionId);

    if (!submission) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Submission not found",
      });
    }

    const feedbackEntry = {
      fromUserId: req.user._id,
      fromUserName: req.user.name,
      message,
      date: new Date(),
    };

    submission.feedback.push(feedbackEntry);
    submission.status = "reviewed";
    await submission.save();

    // Notify the student who submitted
    await Notification.create({
      userId: submission.userId,
      message: `You received feedback on "${submission.title}" from ${req.user.name}`,
      type: "info",
    });

    res.status(201).json(feedbackEntry);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubmissions,
  createSubmission,
  addFeedback,
};
