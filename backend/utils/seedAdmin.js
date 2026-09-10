/**
 * Run with: npm run seed:admin
 * Creates a default admin account if one does not already exist.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || 'admin@shadowalert.app';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
  } else {
    await User.create({
      name: 'City Operations Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'admin',
    });
    console.log(`Admin created: ${email} / ${process.env.ADMIN_PASSWORD || 'ChangeMe123!'}`);
  }
  await mongoose.connection.close();
  process.exit(0);
})();
