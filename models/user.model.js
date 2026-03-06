import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Personal Information
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
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },

  // Role & Status
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },

  // Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isSmsVerified: {
    type: Boolean,
    default: false
  },
  emailOTP: {
    type: String,
    select: false
  },
  smsOTP: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },

  // Additional Info
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  institution: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  subCity: {
    type: String,
    trim: true
  },
  photo: {
    type: String,
    default: null
  },

  // ── Preferred Exam Date (chosen during registration) ──
  preferredDate: {
    type: String,
    trim: true,
    default: null
  },

  // Exam Status
  canTakeExam: {
    type: Boolean,
    default: false
  },
  examAttempted: {
    type: Boolean,
    default: false
  },
  examStartTime: {
    type: Date
  },
  examEndTime: {
    type: Date
  },
  resultVisible: {
    type: Boolean,
    default: false
  },
  examDate: {
    type: Date,
    default: null
  },
}, {
  timestamps: true
});

// ✅ SINGLE combined pre-save hook
userSchema.pre('save', async function() {
  // 1. Auto-generate registration number for new users
  if (this.isNew && !this.registrationNumber) {
    const count = await mongoose.model('User').countDocuments();
    this.registrationNumber = `SP${new Date().getFullYear()}${String(count + 1).padStart(5, '0')}`;
  }

  // 2. Hash password only if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check login eligibility
userSchema.methods.canLogin = function() {
  return this.isEmailVerified &&
    this.isSmsVerified &&
    this.isApproved &&
    this.role === 'user';
};

const User = mongoose.model('User', userSchema);

export default User;