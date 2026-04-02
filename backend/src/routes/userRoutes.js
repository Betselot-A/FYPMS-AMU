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
  bulkUploadUsersFromFile,
  bulkDeleteUsers,
  resetUserPassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// All routes require authentication
router.use(protect);

// Authenticated users can list users (Students/Staff will be filtered in controller)
router.get("/", getUsers);

// Admin-only CRUD
router.post("/", authorize("admin"), createUser);
router.post("/bulk", authorize("admin"), bulkCreateUsers);
router.post("/bulk-upload", authorize("admin"), upload.single("file"), bulkUploadUsersFromFile);
router.delete("/bulk", authorize("admin"), bulkDeleteUsers);

// Authenticated users can view a single user
router.get("/:id", getUserById);

// Admin-only update; Admin or Coordinator can delete
router.put("/:id", authorize("admin"), updateUser);
router.delete("/:id", authorize("admin", "coordinator"), deleteUser);
router.post("/:id/reset-password", authorize("admin"), resetUserPassword);

module.exports = router;
