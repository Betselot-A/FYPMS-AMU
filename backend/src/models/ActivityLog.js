// ============================================================
// Activity Log Model
// ============================================================

const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        action: {
            type: String,
            required: [true, "Action is required"],
        },

        description: {
            type: String,
            default: "",
        },

        ipAddress: {
            type: String,
        },

        module: {
            type: String,
            default: "general", // e.g. auth, project, submission
        },
    },
    {
        timestamps: true,
    }
);

// Transform
activityLogSchema.set("toJSON", {
    transform: (_doc, ret) => {
        ret.id = ret._id;
        ret.loggedAt = ret.createdAt;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
