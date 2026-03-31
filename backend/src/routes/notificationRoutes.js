// ============================================================
// ProjectHub Notification & Announcement API Routes
// ============================================================

const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getSentNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

// Get current user's notifications (inbox)
router.get("/", getNotifications);

// Admin/Coordinator: get messages they sent
router.get("/sent", authorize("admin", "coordinator"), getSentNotifications);

// Mark as read
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

// Admin/Coordinator/Student/Staff: send notifications (direct messages)
router.post("/", createNotification);

module.exports = router;
