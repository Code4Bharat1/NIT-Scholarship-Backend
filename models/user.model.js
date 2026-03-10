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
  tempPassword:{
    type:String
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
  required: [true, 'State is required'],
  trim: true
},
city: {
  type: String,
  required: [true, 'City is required'],
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
preferredDate: {
  type: String
}
}, {
  timestamps: true
});

// ✅ SINGLE combined pre-save hook (no next conflict)
userSchema.pre('save', async function() {
  // 1. Auto-generate registration number for new users
  if (this.isNew && !this.registrationNumber) {
    let isUnique = false;
    let registrationNumber;

    // 🔥 FIX: countDocuments() की जगह random+year use करो
    // ताकि किसी user को delete करने पर duplicate number न बने
    while (!isUnique) {
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(10000 + Math.random() * 90000); // 5-digit random (10000–99999)
      registrationNumber = `SP${year}${randomSuffix}`;

      // Verify uniqueness in DB
      const existing = await mongoose.model('User').findOne({ registrationNumber });
      if (!existing) isUnique = true;
    }

    this.registrationNumber = registrationNumber;
  }

  // 2. Hash password only if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  // NOTE: No next() needed — Mongoose handles async hooks automatically
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