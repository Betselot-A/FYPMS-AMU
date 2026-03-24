// ============================================================
// ProjectHub Evaluation & Grading API Routes
// ============================================================

const express = require("express");
const router = express.Router();
const {
  submitEvaluation,
  getEvaluationsByProject,
  getProjectResults,
} = require("../controllers/evaluationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

// Staff: submit evaluation
router.post("/", authorize("staff", "coordinator"), submitEvaluation);

// Get evaluations for a project
router.get("/:projectId", getEvaluationsByProject);

// Get aggregated results
router.get("/results/:projectId", getProjectResults);

module.exports = router;
