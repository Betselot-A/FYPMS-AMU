const Message = require("../models/Message");
const Project = require("../models/Project");

/**
 * POST /api/messages
 * Send a message to another user
 */
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, projectId, content } = req.body;

    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      projectId: projectId || null,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/messages/:targetUserId
 * Get conversation history between current user and target user
 */
const getConversation = async (req, res, next) => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/messages/read/:targetUserId
 * Mark all messages from target user as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user._id;

    await Message.updateMany(
      { senderId: targetUserId, receiverId: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/messages/unread/count
 * Get total unread message count for current user
 */
const getUnreadCount = async (req, res, next) => {
    try {
        const count = await Message.countDocuments({ receiverId: req.user._id, isRead: false });
        res.json({ count });
    } catch (error) {
        next(error);
    }
};

module.exports = {
  sendMessage,
  getConversation,
  markAsRead,
  getUnreadCount
};
