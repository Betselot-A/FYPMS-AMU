// ============================================================
// ProjectHub User Management System
// ============================================================

const User = require("../models/User");

// Helper: generate random temp password
const generateTempPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pass = "TempPass_";
  for (let i = 0; i < 6; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
};

/**
 * GET /api/users
 * Admin/Coordinator — list users with optional filters
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, department, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({ users, total });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Authenticated — get a single user
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "User not found",
      });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users
 * Admin — create a new user with temporary password
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, role, department, staffAssignment } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        error: "DUPLICATE_EMAIL",
        message: "A user with this email already exists",
      });
    }

    const tempPassword = generateTempPassword();

    const user = await User.create({
      name,
      email,
      password: tempPassword,
      role,
      department,
      staffAssignment: staffAssignment || { isAdvisor: false, isExaminer: false },
      mustChangePassword: true,
    });

    res.status(201).json({ user, tempPassword });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id
 * Admin — update user details
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, email, department, role, staffAssignment, cgpa } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (department !== undefined) user.department = department;
    if (role !== undefined) user.role = role;
    if (staffAssignment !== undefined) user.staffAssignment = staffAssignment;
    if (cgpa !== undefined) user.cgpa = cgpa;

    await user.save();

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Admin — delete a user
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "User not found",
      });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/bulk
 * Admin — bulk create users
 */
const bulkCreateUsers = async (req, res, next) => {
  try {
    const { users } = req.body;
    let created = 0;
    const errors = [];

    for (let i = 0; i < users.length; i++) {
      try {
        const { name, email, role, department, staffAssignment } = users[i];
        const existing = await User.findOne({ email });
        if (existing) {
          errors.push(`Row ${i + 1}: email '${email}' already exists`);
          continue;
        }

        const tempPassword = generateTempPassword();
        await User.create({
          name,
          email,
          password: tempPassword,
          role,
          department,
          staffAssignment: staffAssignment || { isAdvisor: false, isExaminer: false },
          mustChangePassword: true,
        });
        created++;
      } catch (err) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    res.json({ created, errors });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkCreateUsers,
};
