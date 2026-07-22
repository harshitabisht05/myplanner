const mongoose = require('mongoose');

// Default cloud MongoDB connection string for zero-config deployments
const DEFAULT_MONGODB_URI = 'mongodb+srv://planner_app:Planner2026SecureApp@cluster0.a8w5z.mongodb.net/mylittleplanner?retryWrites=true&w=majority';

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  // Re-use active Mongoose connection in serverless environment
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const db = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log(`MongoDB Connected: ${db.connection.host}`);
  } catch (e) {
    console.error(`MongoDB Connection Error (${e.name}): ${e.message}`);
    throw new Error(`MongoDB Connection Failed: ${e.message}`);
  }
};

module.exports = connectDB;
