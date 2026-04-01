// ============================================================
// ProjectHub Project & Proposal Model
// ============================================================

const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  description: { type: String, default: "" },
});

const proposalSchema = new mongoose.Schema({
  titles: {
    type: [String],
    validate: [
      (val) => val.length === 3,
      "A proposal must contain exactly 3 project title options.",
    ],
    required: true,
  },
  descriptions: {
    type: [String],
    validate: [
      (val) => val.length === 3,
      "A proposal must contain exactly 3 project description options.",
    ],
    required: true,
  },
  documentUrl: { type: String }, // Path to PDF/DOCX
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  feedback: { type: String, default: "" }, // For coordinator rejection
  version: { type: Number, default: 1 },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  submittedAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema(
  {
    // Set after coordinator approves a proposal
    department: {
      type: String,
      default: "",
    },
    // finalTitle is set by the coordinator upon approving one of the titles
    finalTitle: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      trim: true,
      default: "Untitled Group",
    },
    description: {
      type: String,
      default: "",
    },
    // Array of student user IDs
    groupMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Store proposal history (latest is always proposals[proposals.length-1])
    proposals: [proposalSchema],
    // Proposal approval workflow
    // "not-submitted" = group exists but no proposal yet
    // "pending"       = proposal submitted, awaiting coordinator review
    // "approved"      = coordinator picked a title
    // "rejected"      = coordinator rejected, student must resubmit
    proposalStatus: {
      type: String,
      enum: ["not-submitted", "pending", "approved", "rejected"],
      default: "not-submitted",
    },
    approvedProposalIndex: {
      type: Number,
      default: null,
    },
    // Advisor (staff member)
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Examiner (staff member)
    examinerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "under-review", "completed"],
      default: "pending",
    },
    deadline: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    milestones: [milestoneSchema],
  },
  {
    timestamps: true,
  }
);

// Transform output
projectSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // Also transform milestone _id
    if (ret.milestones) {
      ret.milestones = ret.milestones.map((m) => {
        m.id = m._id;
        delete m._id;
        return m;
      });
    }
    return ret;
  },
});

module.exports = mongoose.model("Project", projectSchema);
