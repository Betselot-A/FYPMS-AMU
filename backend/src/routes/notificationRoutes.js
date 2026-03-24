// ============================================================
// ProjectHub Notification & Announcement API Routes
// ============================================================

const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

// Get current user's notifications
router.get("/", getNotifications);

// Mark as read
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

// Admin: send notifications
router.post("/", authorize("admin", "coordinator"), createNotification);

module.exports = router;
