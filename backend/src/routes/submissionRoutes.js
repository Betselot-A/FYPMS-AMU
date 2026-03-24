// ============================================================
// ProjectHub Project Submissions API Routes
// ============================================================

const express = require("express");
const router = express.Router();
const {
  getSubmissions,
  createSubmission,
  addFeedback,
} = require("../controllers/submissionController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// All routes require authentication
router.use(protect);

// Get submissions for a project
router.get("/:projectId", getSubmissions);

// Student: create submission with file upload (max 5 files)
router.post("/", authorize("student"), upload.array("files", 5), createSubmission);

// Staff: add feedback to a submission
router.post("/:submissionId/feedback", authorize("staff", "coordinator"), addFeedback);

module.exports = router;
