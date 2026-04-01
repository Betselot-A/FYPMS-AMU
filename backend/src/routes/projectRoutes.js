// ============================================================
// ProjectHub Project Lifecycle API Routes
// ============================================================

const express = require("express");
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateMilestone,
  submitProposal,
  reviewProposal,
  assignStaff,
  bulkCreateProjects,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadProposal } = require("../middleware/uploadMiddleware");

// All routes require authentication
router.use(protect);

// Any authenticated user can view projects (filtered by role in controller)
router.get("/", getProjects);
router.get("/:id", getProjectById);

// Coordinator-only: create, update, delete
router.post("/", authorize("coordinator", "admin"), createProject);
router.post("/bulk", authorize("coordinator", "admin"), bulkCreateProjects);
router.put("/:id", authorize("coordinator", "admin"), updateProject);
router.delete("/:id", authorize("coordinator", "admin"), deleteProject);

// Student: submit a proposal (exactly 3 titles + file)
router.post(
  "/:id/proposals",
  authorize("student"),
  uploadProposal.single("document"),
  submitProposal
);

// Coordinator: review a proposal (approve/reject)
router.put("/:id/proposals/review", authorize("coordinator", "admin"), reviewProposal);

// Coordinator: assign staff (advisor + examiner)
router.put("/:id/assign-staff", authorize("coordinator", "admin"), assignStaff);

// Advisor/Coordinator: update milestones
router.put(
  "/:projectId/milestones/:milestoneId",
  authorize("staff", "coordinator", "admin"),
  updateMilestone
);

module.exports = router;
