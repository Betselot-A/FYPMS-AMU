// ============================================================
// ProjectHub User Management API Routes
// ============================================================

const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkCreateUsers,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// All routes require authentication
router.use(protect);

// Admin & Coordinator can list users
router.get("/", authorize("admin", "coordinator"), getUsers);

// Admin-only CRUD
router.post("/", authorize("admin"), createUser);
router.post("/bulk", authorize("admin"), bulkCreateUsers);

// Authenticated users can view a single user
router.get("/:id", getUserById);

// Admin-only update & delete
router.put("/:id", authorize("admin"), updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;
