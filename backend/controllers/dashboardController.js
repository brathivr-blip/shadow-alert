const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');

// @desc   Aggregate statistics for the analytics dashboard
// @route  GET /api/dashboard/stats
// @access Public
const getStats = asyncHandler(async (req, res) => {
  const [totals, byStatus, byCategory, byAI, resolutionAgg, timeline] = await Promise.all([
    Report.countDocuments(),
    Report.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Report.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Report.aggregate([{ $group: { _id: '$aiDetection.classification', count: { $sum: 1 } } }]),
    Report.aggregate([
      { $match: { status: 'resolved', resolvedAt: { $ne: null } } },
      {
        $project: {
          resolutionHours: { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60] },
        },
      },
      { $group: { _id: null, avgHours: { $avg: '$resolutionHours' } } },
    ]),
    Report.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]),
  ]);

  const statusMap = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
  const categoryMap = Object.fromEntries(byCategory.map((s) => [s._id, s.count]));
  const aiMap = Object.fromEntries(byAI.map((s) => [s._id, s.count]));

  res.json({
    success: true,
    stats: {
      total: totals,
      pending: statusMap.pending || 0,
      verified: statusMap.verified || 0,
      inProgress: statusMap.in_progress || 0,
      resolved: statusMap.resolved || 0,
      rejected: statusMap.rejected || 0,
      byCategory: categoryMap,
      byAI: aiMap,
      avgResolutionHours: resolutionAgg[0] ? Math.round(resolutionAgg[0].avgHours * 10) / 10 : null,
      timeline,
    },
  });
});

module.exports = { getStats };
