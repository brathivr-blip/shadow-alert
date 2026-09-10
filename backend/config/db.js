const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[shadow-alert] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[shadow-alert] MongoDB connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
