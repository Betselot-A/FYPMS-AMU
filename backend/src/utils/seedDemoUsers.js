// ============================================================
// Development Demo User Seeder
// Creates default accounts for local testing (idempotent)
// ============================================================

const User = require("../models/User");
const Project = require("../models/Project");

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
  {
    name: "Bob Smith",
    email: "bob@university.edu",
    password: "password",
    role: "student",
    department: "Computer Science",
    cgpa: 3.65,
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

/**
 * Seeds a demo project for local testing (idempotent)
 * Creates a group containing Alice + Bob if no project already exists for Alice
 */
const seedDemoProject = async () => {
  const alice = await User.findOne({ email: "alice@university.edu" });
  const bob = await User.findOne({ email: "bob@university.edu" });
  if (!alice) return;

  const existing = await Project.findOne({ groupMembers: alice._id });
  if (existing) return; // already seeded

  const members = [alice._id];
  if (bob) members.push(bob._id);

  await Project.create({
    title: "Group CS-01 — Awaiting Proposal",
    department: "Computer Science",
    groupMembers: members,
    status: "pending",
    proposalStatus: "not-submitted",
  });

  console.log("🌱 Seeded demo project group (Alice + Bob)");
};

const runSeedScript = async () => {
  try {
    require("dotenv").config();
    const connectDB = require("../config/db");

    await connectDB();
    const { created, total } = await seedDemoUsers();
    console.log(`🌱 Demo user seed complete: ${created} created, ${total - created} already existed.`);
    await seedDemoProject();
    process.exit(0);
  } catch (error) {
    console.error("❌ Demo user seed failed:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runSeedScript();
}

module.exports = { seedDemoUsers, seedDemoProject, demoUsers };
