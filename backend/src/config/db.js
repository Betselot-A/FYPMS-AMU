// ============================================================
// ProjectHub Database Configuration (MongoDB)
// ============================================================

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error("MongoDB URI is not defined in environment variables (check MONGODB_URI or MONGO_URI)");
    }

    const conn = await mongoose.connect(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ ProjectHub Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ ProjectHub Database Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
