// ============================================================
// ProjectHub Global Grade & Evaluation Configuration
// ============================================================

const mongoose = require("mongoose");

const gradeBandSchema = new mongoose.Schema({
  label: { type: String, required: true },
  minScore: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  color: { type: String, default: "" },
});

const criterionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  weight: { type: Number, required: true }, // e.g. 10 (for 10%)
  phase: { 
    type: String, 
    enum: ["advisor", "examiner", "coordinator", "general"],
    default: "general" 
  },
});

const gradeConfigSchema = new mongoose.Schema(
  {
    bands: [gradeBandSchema],
    criteria: [criterionSchema],
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
