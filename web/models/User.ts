import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'seller'],
    default: 'user',
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  story: {
    type: String,
    maxlength: 2000,
  },
}, {
  timestamps: true,
});

// Index for faster queries
userSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model('User', userSchema);