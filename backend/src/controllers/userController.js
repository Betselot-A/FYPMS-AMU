// ============================================================
// ProjectHub User Management System
// ============================================================

const User = require("../models/User");
const Project = require("../models/Project");
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
    const { role, department, search, page = 1, limit = 1000, groupStatus } = req.query;
    const filter = {};
    let visibilityOr = [];

    // Apply explicit role and department filters
    if (role) {
      filter.role = role;
    }
    if (department && (req.user.role === "admin" || req.user.role === "coordinator")) {
      filter.department = department;
    }

    if (req.user.role === "admin") {
      // Admins see everyone
    } else if (req.user.role === "coordinator") {
      // Coordinators see their own department + all system admins
      visibilityOr = [
        { department: req.user.department },
        { role: "admin" }
      ];
    } else if (req.user.role === "staff") {
      // Staff (Advisor/Examiner) Discovery Logic
      const myProjects = await Project.find({
        $or: [{ advisorId: req.user.id }, { examinerId: req.user.id }]
      });

      const linkedUserIds = new Set();
      myProjects.forEach(p => {
        p.groupMembers.forEach(id => linkedUserIds.add(id.toString()));
        if (p.advisorId) linkedUserIds.add(p.advisorId.toString());
        if (p.examinerId) linkedUserIds.add(p.examinerId.toString());
      });

      // Discover linked users, system admins, and their coordinator
      visibilityOr = [
        { _id: { $in: Array.from(linkedUserIds) } },
        { role: "admin" },
        { role: "coordinator", department: req.user.department }
      ];
    } else if (req.user.role === "student") {
      // Student Discovery Logic
      const myProject = await Project.findOne({ groupMembers: req.user.id });
      const linkedUserIds = [];
      if (myProject) {
        if (myProject.advisorId) linkedUserIds.push(myProject.advisorId);
        if (myProject.examinerId) linkedUserIds.push(myProject.examinerId);
      }

      // See Advisor, Examiner, Admins, and Coordinator
      visibilityOr = [
        { _id: { $in: linkedUserIds } },
        { role: "admin" },
        { role: "coordinator", department: req.user.department }
      ];
    }

    if (visibilityOr.length > 0) {
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: visibilityOr });
    }

    // Grouping Status Filter
    if (groupStatus === "grouped" || groupStatus === "ungrouped") {
      const allProjects = await Project.find({}, "groupMembers");
      const groupedUserIds = allProjects.flatMap(p => p.groupMembers.map(id => id.toString()));
      
      if (groupStatus === "grouped") {
        filter._id = { ...filter._id, $in: groupedUserIds };
      } else {
        filter._id = { ...filter._id, $nin: groupedUserIds };
      }
    }

    // Apply search search across name and email
    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      });
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
    const { name, email, role, department, studentId, staffAssignment } = req.body;

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
      studentId: studentId || "",
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
    const { name, email, department, studentId, role, staffAssignment, cgpa } = req.body;

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
    if (studentId !== undefined) user.studentId = studentId;
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
        const { name, email, role, department, studentId, staffAssignment } = users[i];
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
          studentId: studentId || "",
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
      const studentId = row.studentId || row.studentID || row["Student ID"] || row.id || row.ID || "";
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
          studentId: studentId.toString(),
          mustChangePassword: true,
        });

        createdUsers.push({
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
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

/**
 * POST /api/users/:id/reset-password
 * Admin only
 */
const resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const Settings = require("../models/Settings");
    let settings = await Settings.findOne();
    const defaultPass = settings ? settings.defaultPassword : "Welcome@123";

    user.password = defaultPass;
    user.mustChangePassword = true;
    await user.save();

    res.json({ message: `Password reset to default for ${user.name}` });
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
  resetUserPassword,
};
