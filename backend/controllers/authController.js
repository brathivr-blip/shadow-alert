const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array().map((e) => e.msg).join(', '));
    err.statusCode = 400;
    throw err;
  }
};

// @desc   Register a new citizen or admin
// @route  POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  handleValidation(req);
  const { name, email, password, phone, ward } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error('An account with that email already exists.');
  }

  const palette = ['#F5A623', '#34D399', '#60A5FA', '#F472B6', '#F97316'];
  const avatarColor = palette[Math.floor(Math.random() * palette.length)];

  const user = await User.create({ name, email, password, phone, ward, avatarColor });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: user.toSafeObject(),
  });
});

// @desc   Login
// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  handleValidation(req);
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: user.toSafeObject(),
  });
});

// @desc   Current logged-in user
// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc   Update profile
// @route  PUT /api/auth/me
// @access Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, ward } = req.body;
  if (name) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (ward !== undefined) req.user.ward = ward;
  await req.user.save();
  res.json({ success: true, user: req.user.toSafeObject() });
});

// Store only coordinates supplied by the browser's W3C Geolocation API.
const updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude, accuracy, speed, heading, locationType = 'current' } = req.body;
  const values = [latitude, longitude, accuracy];

  if (!values.every((value) => Number.isFinite(Number(value)))) {
    res.status(400);
    throw new Error('Latitude, longitude, and accuracy are required.');
  }
  if (Number(latitude) < -90 || Number(latitude) > 90 || Number(longitude) < -180 || Number(longitude) > 180) {
    res.status(400);
    throw new Error('Invalid geographic coordinates.');
  }

  const location = {
    latitude: Number(latitude),
    longitude: Number(longitude),
    accuracy: Math.max(0, Number(accuracy)),
  };

  if (locationType === 'initial') {
    req.user.initialLocation = { ...location, capturedAt: new Date() };
  } else {
    req.user.liveLocation = {
      ...location,
      speed: Number.isFinite(Number(speed)) && Number(speed) >= 0 ? Number(speed) : null,
      heading: Number.isFinite(Number(heading)) && Number(heading) >= 0 ? Number(heading) % 360 : null,
      updatedAt: new Date(),
    };
  }
  await req.user.save();
  res.json({ success: true, initialLocation: req.user.initialLocation, liveLocation: req.user.liveLocation });
});

module.exports = { register, login, getMe, updateMe, updateLocation };
