// ============================================================
// ProjectHub User Management System
// ============================================================

const User = require("../models/User");
const fs = require("fs");
const csv = require("csv-parser");
const XLSX = require("xlsx");

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
    
    // Departmental Isolation: Coordinators can only see their own department
    if (req.user.role === "coordinator") {
      filter.department = req.user.department;
      // Filter students and staff only (optional, but usually coordinators manage these)
      filter.role = { $in: ["student", "staff"] };
    } else if (department) {
      filter.department = department;
    }

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

    // Departmental Isolation: Coordinators force their department
    let userDept = department;
    if (req.user.role === "coordinator") {
      userDept = req.user.department;
    }

    const tempPassword = generateTempPassword();

    const user = await User.create({
      name,
      email,
      password: tempPassword,
      role,
      department: userDept,
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
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Departmental Isolation: Coordinators can only delete users in their department
    if (req.user.role === "coordinator" && user.department !== req.user.department) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "You can only delete users from your own department",
      });
    }

    await User.findByIdAndDelete(req.params.id);
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

        // Departmental Isolation: Coordinators force their department
        let userDept = department;
        if (req.user.role === "coordinator") {
          userDept = req.user.department;
        }

        const tempPassword = generateTempPassword();
        await User.create({
          name,
          email,
          password: tempPassword,
          role,
          department: userDept,
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

/**
 * POST /api/users/bulk-upload
 * Admin — bulk create users from uploaded CSV file
 */
const bulkUploadUsersFromFile = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      error: "MISSING_FILE",
      message: "No file uploaded. Please provide a CSV file.",
    });
  }

  const results = [];
  const errors = [];
  const createdUsers = [];
  const fileExtension = req.file.originalname.split(".").pop().toLowerCase();

  const processRows = async (rows) => {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = row.name || row.Name || row.fullname || row.FullName || row["Full Name"];
      const email = row.email || row.Email;
      let role = row.role || row.Role || "student";
      let department = row.department || row.Department || "";

      // Departmental Isolation: Coordinators force their department
      if (req.user.role === "coordinator") {
        department = req.user.department;
      }

      if (!name || !email) {
        errors.push(`Row ${i + 1}: Name and email are required.`);
        continue;
      }

      role = role.toLowerCase().trim();
      if (!["admin", "student", "staff", "coordinator"].includes(role)) {
        role = "student";
      }

      try {
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
          errors.push(`Row ${i + 1}: Email '${email}' already exists.`);
          continue;
        }

        const tempPassword = generateTempPassword();
        const user = await User.create({
          name,
          email: email.toLowerCase(),
          password: tempPassword,
          role,
          department,
          mustChangePassword: true,
        });

        createdUsers.push({
          name: user.name,
          email: user.email,
          role: user.role,
          tempPassword,
        });
      } catch (err) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.json({
      message: `Processed ${rows.length} rows.`,
      createdCount: createdUsers.length,
      createdUsers,
      errors,
    });
  };

  if (fileExtension === "csv") {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => processRows(results))
      .on("error", (err) => {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        next(err);
      });
  } else if (["xlsx", "xls"].includes(fileExtension)) {
    try {
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);
      await processRows(rows);
    } catch (err) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      next(err);
    }
  } else {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(400).json({
      error: "INVALID_FILE_TYPE",
      message: "Unsupported file type. Please upload CSV or Excel (.xlsx, .xls).",
    });
  }
};

/**
 * DELETE /api/users/bulk
 * Admin — delete multiple users
 */
const bulkDeleteUsers = async (req, res, next) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        error: "MISSING_IDS",
        message: "No user IDs provided for deletion",
      });
    }

    // Departmental Isolation: Coordinators check IDs
    if (req.user.role === "coordinator") {
      const targetUsers = await User.find({ _id: { $in: userIds } });
      const invalidUsers = targetUsers.filter(u => u.department !== req.user.department);
      if (invalidUsers.length > 0) {
        return res.status(403).json({
          error: "FORBIDDEN",
          message: "You can only delete users from your own department",
        });
      }
    }

    const result = await User.deleteMany({ _id: { $in: userIds } });

    res.json({
      message: `Successfully deleted ${result.deletedCount} users`,
      deletedCount: result.deletedCount,
    });
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
  bulkUploadUsersFromFile,
  bulkDeleteUsers,
};
