import mongoose from 'mongoose';
import {
  sharedFields,
  applySharedHooks,
  applySharedMethods,
} from './shared.model.js';

// ── Schema ─────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    ...sharedFields,

    role: { type: String, default: 'user', immutable: true },

    // ── Approval ─────────────────────────────────────────────────
    isApproved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    approvedAt: { type: Date },

    // ── Profile / Location ───────────────────────────────────────
    institution: { type: String, trim: true },
    state:       { type: String, trim: true },
    city:        { type: String, trim: true },
    subCity:     { type: String, trim: true },

    // ── Preferred Exam Date ──────────────────────────────────────
    preferredDate: { type: String, trim: true, default: null },

    // ── Exam Status ──────────────────────────────────────────────
    canTakeExam:   { type: Boolean, default: false },
    examAttempted: { type: Boolean, default: false },
    examStartTime: { type: Date },
    examEndTime:   { type: Date },
    resultVisible: { type: Boolean, default: false },
    examDate:      { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'users',   // ✅ separate collection
  }
);

// ── Hooks & Methods ────────────────────────────────────────────────
applySharedHooks(userSchema, () => User);
applySharedMethods(userSchema);

// ── User-specific Methods ──────────────────────────────────────────

/** True only when fully verified & approved */
userSchema.methods.canLogin = function () {
  return this.isEmailVerified && this.isSmsVerified && this.isApproved;
};

/** Mark exam as started */
userSchema.methods.startExam = function () {
  this.canTakeExam   = true;
  this.examAttempted = true;
  this.examStartTime = new Date();
};

/** Mark exam as finished */
userSchema.methods.finishExam = function () {
  this.examEndTime   = new Date();
  this.resultVisible = true;
};

const User = mongoose.model('User', userSchema);

export default User;