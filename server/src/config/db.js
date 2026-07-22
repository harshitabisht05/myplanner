const mongoose = require('mongoose');

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI;

  if (!connStr) {
    throw new Error('MONGODB_URI environment variable is missing in Vercel Project Settings.');
  }

  // Check if connection is already established
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const db = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of hanging
    });
    console.log(`MongoDB Connected: ${db.connection.host}`);
  } catch (e) {
    console.error(`MongoDB Connection Error: ${e.message}`);
    throw e;
  }
};

module.exports = connectDB;
