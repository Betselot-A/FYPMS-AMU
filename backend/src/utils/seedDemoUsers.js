// ============================================================
// Development Demo User Seeder
// Creates default accounts for local testing (idempotent)
// ============================================================

const User = require("../models/User");

const demoUsers = [
  {
    name: "Admin User",
    email: "admin@university.edu",
    password: "password",
    role: "admin",
    department: "Administration",
  },
  {
    name: "Alice Johnson",
    email: "alice@university.edu",
    password: "password",
    role: "student",
    department: "Computer Science",
    cgpa: 3.85,
  },
  {
    name: "Dr. Sarah Wilson",
    email: "sarah.w@university.edu",
    password: "password",
    role: "staff",
    department: "Computer Science",
    staffAssignment: { isAdvisor: true, isExaminer: true },
  },
  {
    name: "Prof. Michael Chen",
    email: "michael.c@university.edu",
    password: "password",
    role: "coordinator",
    department: "Computer Science",
  },
];

const seedDemoUsers = async () => {
  let created = 0;

  for (const userData of demoUsers) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) continue;

    await User.create({
      ...userData,
      mustChangePassword: false,
    });

    created += 1;
  }

  return { created, total: demoUsers.length };
};

const runSeedScript = async () => {
  try {
    require("dotenv").config();
    const connectDB = require("../config/db");

    await connectDB();
    const { created, total } = await seedDemoUsers();

    console.log(`🌱 Demo user seed complete: ${created} created, ${total - created} already existed.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Demo user seed failed:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runSeedScript();
}

module.exports = { seedDemoUsers, demoUsers };
