import bcrypt from 'bcryptjs';

// ── Shared Fields (copy into each schema) ─────────────────────────
export const sharedFields = {
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  isEmailVerified: { type: Boolean, default: false },
  isSmsVerified:   { type: Boolean, default: false },
  emailOTP:   { type: String, select: false },
  smsOTP:     { type: String, select: false },
  otpExpires: { type: Date,   select: false },
  photo: { type: String, default: null },
};

// ── Generate unique SP registration number ─────────────────────────
export async function generateRegistrationNumber(Model) {
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 5; attempt++) {
    const ts        = Date.now().toString().slice(-6);
    const rand      = Math.floor(100 + Math.random() * 900);
    const candidate = `SP${year}${ts}${rand}`;

    // eslint-disable-next-line no-await-in-loop
    const exists = await Model.findOne({ registrationNumber: candidate }).lean();
    if (!exists) return candidate;
  }

  return `SP${year}${Date.now()}`; // ultra-safe fallback
}

// ── Attach shared pre-save hook to any schema ──────────────────────
export function applySharedHooks(schema, getModel) {
  schema.pre('save', async function () {
    // 1. Auto-generate registration number
    if (this.isNew && !this.registrationNumber) {
      this.registrationNumber = await generateRegistrationNumber(getModel());
    }

    // 2. Hash password if modified
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  });
}

// ── Attach shared methods to any schema ───────────────────────────
export function applySharedMethods(schema) {
  schema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  schema.methods.generateOTP = function () {
    return Math.floor(100_000 + Math.random() * 900_000).toString();
  };
}