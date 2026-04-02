const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// POST /api/messages
router.post("/", messageController.sendMessage);

// GET /api/messages/:targetUserId
router.get("/:targetUserId", messageController.getConversation);

// PUT /api/messages/read/:targetUserId
router.put("/read/:targetUserId", messageController.markAsRead);

// GET /api/messages/unread/count
router.get("/unread/count", messageController.getUnreadCount);

module.exports = router;
