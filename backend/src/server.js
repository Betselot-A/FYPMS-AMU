// ============================================================
// ProjectHub Backend: API Server Entry Point
// ============================================================

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("./config/db");
const { seedDemoUsers } = require("./utils/seedDemoUsers");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// Import route files
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const staffRoutes = require("./routes/staffRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");

const app = express();

// --------------- Global Middleware ---------------
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// --------------- API Routes ---------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/evaluations", evaluationRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --------------- Error Handling ---------------
app.use(notFound);
app.use(errorHandler);

const shouldSeedDemoUsers =
  process.env.NODE_ENV !== "production" && process.env.DISABLE_DEMO_SEED !== "true";

// --------------- Start Server ---------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    if (shouldSeedDemoUsers) {
      const { created } = await seedDemoUsers();
      if (created > 0) {
        console.log(`🌱 Seeded ${created} demo user(s) for local development.`);
      }
    }

    app.listen(PORT, () => {
      console.log(`🚀 ProjectHub API is live on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
