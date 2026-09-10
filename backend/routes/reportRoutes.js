const express = require('express');
const {
  createReport,
  getReports,
  getMapReports,
  getReportById,
  confirmReport,
  updateStatus,
  addNote,
  deleteReport,
} = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/map', getMapReports);
router.get('/', getReports);
router.post('/', protect, upload.single('photo'), createReport);
router.get('/:id', getReportById);
router.post('/:id/confirm', protect, confirmReport);
router.post('/:id/notes', protect, addNote);
router.patch('/:id/status', protect, adminOnly, updateStatus);
router.delete('/:id', protect, deleteReport);

module.exports = router;
