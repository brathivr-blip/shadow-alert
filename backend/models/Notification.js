const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['status_change', 'note_added', 'confirmation', 'system'], default: 'system' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
