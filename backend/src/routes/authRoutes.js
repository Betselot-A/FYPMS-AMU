// ============================================================
// ProjectHub Authentication & Security API Routes
// ============================================================

const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getProfile,
  changePassword,
  resetUserPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getProfile);
router.put("/change-password", protect, changePassword);

// Admin-only: reset another user's password
router.post("/reset-password/:userId", protect, authorize("admin"), resetUserPassword);

module.exports = router;
