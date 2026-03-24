// ============================================================
// Message Model
// ============================================================

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null,
        },

        content: {
            type: String,
            required: [true, "Message content is required"],
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Transform
messageSchema.set("toJSON", {
    transform: (_doc, ret) => {
        ret.id = ret._id;
        ret.sentAt = ret.createdAt;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model("Message", messageSchema);
