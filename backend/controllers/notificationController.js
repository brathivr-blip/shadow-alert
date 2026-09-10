const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc   Get my notifications
// @route  GET /api/notifications
// @access Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ success: true, notifications, unreadCount });
});

// @desc   Mark one notification read
// @route  PATCH /api/notifications/:id/read
// @access Private
const markRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notif) {
    res.status(404);
    throw new Error('Notification not found.');
  }
  notif.read = true;
  await notif.save();
  res.json({ success: true, notification: notif });
});

// @desc   Mark all read
// @route  PATCH /api/notifications/read-all
// @access Private
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true });
});

module.exports = { getMyNotifications, markRead, markAllRead };
