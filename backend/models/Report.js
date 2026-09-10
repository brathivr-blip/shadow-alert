const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 500 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const historySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, default: 'system' },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reporterName: { type: String, required: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 1000 },
    category: {
      type: String,
      enum: ['missing', 'not_working', 'flickering', 'dim', 'damaged_pole', 'daytime_burning'],
      required: true,
    },
    imageUrl: { type: String, required: [true, 'Photo evidence is required'] },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        // [longitude, latitude]
        type: [Number],
        required: true,
        validate: {
          validator: (v) => Array.isArray(v) && v.length === 2,
          message: 'Coordinates must be [longitude, latitude]',
        },
      },
    },
    address: { type: String, trim: true, default: '' },
    isSensitiveZone: { type: Boolean, default: false }, // near school / hospital / high-crime area
    status: {
      type: String,
      enum: ['pending', 'verified', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    priorityScore: { type: Number, default: 0 },
    aiDetection: {
      classification: {
        type: String,
        enum: ['likely_faulty', 'likely_functional', 'inconclusive'],
        default: 'inconclusive',
      },
      confidence: { type: Number, default: 0 }, // 0-100
      avgBrightness: { type: Number, default: 0 },
      brightPixelRatio: { type: Number, default: 0 },
      contrastScore: { type: Number, default: 0 },
      summary: { type: String, default: '' },
      analyzedAt: { type: Date },
    },
    confirmations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
    notes: [noteSchema],
    statusHistory: { type: [historySchema], default: () => [{ status: 'pending', changedBy: 'system' }] },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reportSchema.index({ location: '2dsphere' });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ title: 'text', description: 'text', address: 'text' });

reportSchema.virtual('confirmationCount').get(function get() {
  return this.confirmations ? this.confirmations.length : 0;
});

reportSchema.set('toJSON', { virtuals: true });
reportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Report', reportSchema);
