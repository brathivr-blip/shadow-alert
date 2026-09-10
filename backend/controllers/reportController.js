const asyncHandler = require('express-async-handler');
const path = require('path');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const { analyzeStreetlightImage, computePriorityScore } = require('../utils/aiDetection');

const EARTH_RADIUS_METERS = 6371000;
const DUPLICATE_RADIUS_METERS = 40;

const toRad = (deg) => (deg * Math.PI) / 180;

function haversineDistance([lng1, lat1], [lng2, lat2]) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

const emitToUser = (req, userId, event, payload) => {
  const io = req.app.get('io');
  if (io) io.to(`user:${userId}`).emit(event, payload);
};

// @desc   Create a new streetlight report (with photo)
// @route  POST /api/reports
// @access Private
const createReport = asyncHandler(async (req, res) => {
  const { title, description, category, latitude, longitude, address, isSensitiveZone } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error('A photo of the streetlight is required.');
  }
  if (!latitude || !longitude) {
    res.status(400);
    throw new Error('Location coordinates are required.');
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  const absolutePath = path.join(__dirname, '..', 'uploads', req.file.filename);

  const aiResult = await analyzeStreetlightImage(absolutePath);

  const coordinates = [parseFloat(longitude), parseFloat(latitude)];

  // Duplicate detection: nearby pending/verified reports of the same category
  const nearbyCandidates = await Report.find({
    status: { $in: ['pending', 'verified', 'in_progress'] },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates },
        $maxDistance: DUPLICATE_RADIUS_METERS,
      },
    },
  }).limit(5);

  const duplicate = nearbyCandidates.find(
    (r) => haversineDistance(r.location.coordinates, coordinates) <= DUPLICATE_RADIUS_METERS
  );

  const priorityScore = computePriorityScore({
    aiClassification: aiResult.classification,
    aiConfidence: aiResult.confidence,
    confirmationCount: 0,
    isSensitiveZone: isSensitiveZone === 'true' || isSensitiveZone === true,
  });

  const report = await Report.create({
    reporter: req.user._id,
    reporterName: req.user.name,
    title,
    description,
    category,
    imageUrl,
    location: { type: 'Point', coordinates },
    address: address || '',
    isSensitiveZone: isSensitiveZone === 'true' || isSensitiveZone === true,
    aiDetection: aiResult,
    priorityScore,
    duplicateOf: duplicate ? duplicate._id : null,
    status: 'pending',
  });

  if (duplicate) {
    duplicate.confirmations.addToSet(req.user._id);
    duplicate.priorityScore = computePriorityScore({
      aiClassification: duplicate.aiDetection.classification,
      aiConfidence: duplicate.aiDetection.confidence,
      confirmationCount: duplicate.confirmations.length,
      isSensitiveZone: duplicate.isSensitiveZone,
    });
    await duplicate.save();
  }

  req.user.points += 10;
  await req.user.save();

  res.status(201).json({ success: true, report, duplicateOf: duplicate ? duplicate._id : null });
});

// @desc   List reports with filters, search, pagination
// @route  GET /api/reports
// @access Public
const getReports = asyncHandler(async (req, res) => {
  const { status, category, search, mine, page = 1, limit = 12, sort = '-createdAt' } = req.query;

  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (mine === 'true' && req.user) query.reporter = req.user._id;
  if (search) query.$text = { $search: search };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

  const [reports, total] = await Promise.all([
    Report.find(query)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('reporter', 'name email'),
    Report.countDocuments(query),
  ]);

  res.json({
    success: true,
    reports,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc   All reports for map view (lean, unpaginated within a cap)
// @route  GET /api/reports/map
// @access Public
const getMapReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const reports = await Report.find(query)
    .select('title status category location address aiDetection.classification priorityScore createdAt')
    .limit(1000);
  res.json({ success: true, reports });
});

// @desc   Single report
// @route  GET /api/reports/:id
// @access Public
const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('reporter', 'name email')
    .populate('notes.author', 'name role');
  if (!report) {
    res.status(404);
    throw new Error('Report not found.');
  }
  res.json({ success: true, report });
});

// @desc   Confirm/upvote a report ("I see this too")
// @route  POST /api/reports/:id/confirm
// @access Private
const confirmReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found.');
  }
  if (report.confirmations.some((id) => id.equals(req.user._id))) {
    res.status(409);
    throw new Error('You already confirmed this report.');
  }
  if (report.reporter.equals(req.user._id)) {
    res.status(400);
    throw new Error('You cannot confirm your own report.');
  }

  report.confirmations.push(req.user._id);
  report.priorityScore = computePriorityScore({
    aiClassification: report.aiDetection.classification,
    aiConfidence: report.aiDetection.confidence,
    confirmationCount: report.confirmations.length,
    isSensitiveZone: report.isSensitiveZone,
  });
  await report.save();

  await Notification.create({
    user: report.reporter,
    report: report._id,
    title: 'Someone confirmed your report',
    message: `${req.user.name} also spotted the streetlight issue on "${report.title}".`,
    type: 'confirmation',
  });
  emitToUser(req, report.reporter, 'notification', { title: 'New confirmation', reportId: report._id });

  res.json({ success: true, report });
});

// @desc   Update status (admin) + optional note
// @route  PATCH /api/reports/:id/status
// @access Private/Admin
const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const allowed = ['pending', 'verified', 'in_progress', 'resolved', 'rejected'];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value.');
  }

  const report = await Report.findById(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found.');
  }

  report.status = status;
  report.statusHistory.push({ status, changedBy: req.user.name });
  if (status === 'resolved') report.resolvedAt = new Date();

  if (note && note.trim()) {
    report.notes.push({ text: note.trim(), author: req.user._id, authorName: req.user.name });
  }

  await report.save();

  const notif = await Notification.create({
    user: report.reporter,
    report: report._id,
    title: 'Report status updated',
    message: `Your report "${report.title}" is now marked as ${status.replace('_', ' ')}.`,
    type: 'status_change',
  });
  emitToUser(req, report.reporter, 'notification', notif);

  res.json({ success: true, report });
});

// @desc   Add an admin/citizen note (discussion thread)
// @route  POST /api/reports/:id/notes
// @access Private
const addNote = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Note text is required.');
  }
  const report = await Report.findById(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found.');
  }
  report.notes.push({ text: text.trim(), author: req.user._id, authorName: req.user.name });
  await report.save();

  if (!report.reporter.equals(req.user._id)) {
    const notif = await Notification.create({
      user: report.reporter,
      report: report._id,
      title: 'New comment on your report',
      message: `${req.user.name} commented: "${text.trim().slice(0, 80)}"`,
      type: 'note_added',
    });
    emitToUser(req, report.reporter, 'notification', notif);
  }

  res.status(201).json({ success: true, report });
});

// @desc   Delete a report (admin, or reporter if still pending)
// @route  DELETE /api/reports/:id
// @access Private
const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found.');
  }
  const isOwnerPending = report.reporter.equals(req.user._id) && report.status === 'pending';
  if (req.user.role !== 'admin' && !isOwnerPending) {
    res.status(403);
    throw new Error('You cannot delete this report.');
  }
  await report.deleteOne();
  res.json({ success: true, message: 'Report deleted.' });
});

module.exports = {
  createReport,
  getReports,
  getMapReports,
  getReportById,
  confirmReport,
  updateStatus,
  addNote,
  deleteReport,
};
