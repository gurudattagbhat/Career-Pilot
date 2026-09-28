import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      code: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 }
    },
    resetOtp: {
      code: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 }
    },
    avatar: {
      type: String,
      default: ''
    },
    targetRole: {
      type: String,
      default: ''
    },
    headline: {
      type: String,
      default: ''
    },
    experienceLevel: {
      type: String,
      default: 'Mid-Level'
    },
    currentCtcLpa: {
      type: Number,
      default: 0
    },
    expectedCtcLpa: {
      type: Number,
      default: 0
    },
    noticePeriodDays: {
      type: Number,
      default: 30
    },
    location: {
      type: String,
      default: 'India'
    },
    skills: {
      type: [String],
      default: []
    },
    savedJobs: {
      type: Array,
      default: []
    },
    applications: {
      type: Array,
      default: []
    },
    resumeProfile: {
      type: Object,
      default: null
    },
    atsAnalyses: {
      type: Array,
      default: []
    },
    careerPreferences: {
      type: Object,
      default: {}
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Pre-save password hashing hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe user object for API responses
userSchema.methods.toSafeObject = function () {
  const user = this.toObject();
  delete user.password;
  if (user.otp) delete user.otp.code;
  if (user.resetOtp) delete user.resetOtp.code;
  return user;
};

// Model export
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
