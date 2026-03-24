// ============================================================
// Grade / Evaluation Model
// ============================================================

const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Which evaluation phase (advisor, examiner, coordinator, etc.)
    phaseId: {
      type: String,
      default: "general",
    },
    marks: [
      {
        criterionId: { type: String },
        mark: { type: Number },
      },
    ],
    totalMark: {
      type: Number,
      default: 0,
    },
    comments: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // submittedAt = createdAt
  }
);

gradeSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.submittedAt = ret.createdAt;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Grade", gradeSchema);
