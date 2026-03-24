// ============================================================
// ProjectHub User Account & Profile Model
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["admin", "student", "staff", "coordinator"],
      default: "student",
    },
    department: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    // Staff-specific: whether this staff member acts as advisor/examiner
    staffAssignment: {
      isAdvisor: { type: Boolean, default: false },
      isExaminer: { type: Boolean, default: false },
    },
    // Student-specific
    cgpa: {
      type: Number,
      default: null,
    },
    // Flag for admin-created accounts requiring password change
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// --------------- Pre-save: Hash password ---------------
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --------------- Instance method: Compare password ---------------
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// --------------- Transform output (remove password, rename _id) ---------------
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
