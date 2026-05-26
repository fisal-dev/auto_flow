const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_CONNECTION_STRING || process.env.MONGODB_URI;
    if (!connStr) {
      throw new Error('Database connection string is not defined in the environment variables');
    }
    await mongoose.connect(connStr);
    console.log(`MongoDB Connected: ${connStr}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
