// ============================================================
// Notification Model
// ============================================================

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    subject: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      required: true,
    },
    attachmentUrl: {
      type: String,
      default: null,
    },
    attachmentName: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "deadline"],
      default: "info",
    },
    read: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isAnnouncement: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // date = createdAt
  }
);

notificationSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.date = ret.createdAt;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
