// ============================================================
// ProjectHub Global Grade & Evaluation Configuration
// ============================================================

const mongoose = require("mongoose");

const criterionItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  maxMark: { type: Number, required: true, default: 5 },
});

const evaluationPhaseSchema = new mongoose.Schema({
  id: { type: String, required: true }, // unique string ID for frontend syncing
  name: { type: String, required: true },
  active: { type: Boolean, default: true },
  weight: { type: Number, required: true, default: 0 },
  criteria: [criterionItemSchema],
});

const gradeBandSchema = new mongoose.Schema({
  label: { type: String, required: true },
  minScore: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  color: { type: String, default: "" },
});

const gradeConfigSchema = new mongoose.Schema(
  {
    bands: [gradeBandSchema],
    phases: [evaluationPhaseSchema],
  },
  {
    timestamps: true,
  }
);

gradeConfigSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("GradeConfig", gradeConfigSchema);
