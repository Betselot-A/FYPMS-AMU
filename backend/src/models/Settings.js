// ============================================================
// ProjectHub Global System Settings Model
// ============================================================

const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    systemName: {
      type: String,
      default: "ProjectHub",
    },
    defaultPassword: {
      type: String,
      default: "Welcome@123",
    },
    academicSemester: {
      type: String,
      default: "I",
      enum: ["I", "II", "III", "IV"],
    },
    academicYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    allowProposals: {
      type: Boolean,
      default: true,
    },
    registrationDeadline: {
      type: Date,
    },
    smtpHost: { type: String, default: "" },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: "" },
    smtpPassword: { type: String, default: "" },
    emailFrom: { type: String, default: "noreply@projecthub.edu" },
  },
  {
    timestamps: true,
  }
);

settingsSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Settings", settingsSchema);
