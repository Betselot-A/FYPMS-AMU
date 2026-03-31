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
  markFromUserRead,
  uploadAttachment,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(protect);

// Get current user's notifications (inbox)
router.get("/", getNotifications);

// Admin/Coordinator: get messages they sent
router.get("/sent", authorize("admin", "coordinator"), getSentNotifications);

// Mark as read
router.put("/read-all", markAllAsRead);
router.put("/read-from/:userId", markFromUserRead);
router.put("/:id/read", markAsRead);

// Upload endpoint for messaging
router.post("/upload", upload.single("attachment"), uploadAttachment);

// Admin/Coordinator/Student/Staff: send notifications (direct messages)
router.post("/", createNotification);

module.exports = router;
