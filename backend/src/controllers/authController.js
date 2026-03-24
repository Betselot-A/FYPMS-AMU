// ============================================================
// ProjectHub Authentication System
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper: generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Helper: generate random temp password
const generateTempPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pass = "TempPass_";
  for (let i = 0; i < 6; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
};

/**
 * POST /api/auth/register
 * Public — create a new account (or admin-created)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        error: "DUPLICATE_EMAIL",
        message: "A user with this email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
      department: department || "",
    });

    const token = generateToken(user._id);

    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Public — authenticate with email + password
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "MISSING_FIELDS",
        message: "Email and password are required",
      });
    }

    // Explicitly select password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.json({ token, user });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Authenticated — client discards token; server acknowledges
 */
const logout = (_req, res) => {
  res.json({ message: "Signed out of ProjectHub" });
};

/**
 * GET /api/auth/me
 * Authenticated — return current user profile
 */
const getProfile = async (req, res) => {
  res.json(req.user);
};

/**
 * PUT /api/auth/change-password
 * Authenticated — change own password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        error: "WRONG_PASSWORD",
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: "Password changed" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password/:userId
 * Admin only — generate a temporary password for a user
 */
const resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "User not found",
      });
    }

    const tempPassword = generateTempPassword();
    user.password = tempPassword;
    user.mustChangePassword = true;
    await user.save();

    res.json({ tempPassword });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  changePassword,
  resetUserPassword,
};
