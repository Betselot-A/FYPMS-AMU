// ============================================================
// Deadline Model
// ============================================================

const mongoose = require("mongoose");

const deadlineSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        title: {
            type: String,
            required: [true, "Deadline title is required"],
        },

        dueDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "completed", "overdue"],
            default: "pending",
        },

        description: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Transform
deadlineSchema.set("toJSON", {
    transform: (_doc, ret) => {
        ret.id = ret._id;
        ret.createdDate = ret.createdAt;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model("Deadline", deadlineSchema);
