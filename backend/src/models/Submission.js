// ============================================================
// Submission Model
// ============================================================

const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fromUserName: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const submissionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Submission title is required"],
    },
    // Array of GridFS file IDs
    files: [{ type: mongoose.Schema.Types.ObjectId }],
    feedback: [feedbackSchema],
    status: {
      type: String,
      enum: ["submitted", "reviewed", "graded"],
      default: "submitted",
    },
    marks: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true, // submissionDate = createdAt
  }
);

submissionSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.submissionDate = ret.createdAt;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Submission", submissionSchema);
