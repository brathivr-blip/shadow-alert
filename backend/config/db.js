const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!process.env.MONGO_URI) {
    const error = new Error('Database is not configured. Set MONGO_URI in Netlify environment variables.');
    error.statusCode = 503;
    throw error;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[shadow-alert] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[shadow-alert] MongoDB connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
