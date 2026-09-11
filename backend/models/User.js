const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
    phone: { type: String, trim: true, default: '' },
    ward: { type: String, trim: true, default: '' },
    points: { type: Number, default: 0 },
    avatarColor: { type: String, default: '#F5A623' },
    liveLocation: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
      accuracy: { type: Number, min: 0 },
      speed: { type: Number, min: 0, default: null },
      heading: { type: Number, min: 0, max: 360, default: null },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    ward: this.ward,
    points: this.points,
    avatarColor: this.avatarColor,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
