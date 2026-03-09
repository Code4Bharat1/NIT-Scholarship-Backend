import mongoose from 'mongoose';
import {
  sharedFields,
  applySharedHooks,
  applySharedMethods,
} from './shared.model.js';

// ── Schema ─────────────────────────────────────────────────────────
const adminSchema = new mongoose.Schema(
  {
    ...sharedFields,

    role: { type: String, default: 'admin', immutable: true },

    // ── Admin-specific Permissions ───────────────────────────────
    isSuperAdmin: { type: Boolean, default: false },

    permissions: {
      type: [String],
      enum: [
        'manage_users',   // approve / reject / delete users
        'manage_exams',   // create / edit / delete exams
        'view_results',   // view all exam results
        'manage_admins',  // only super-admin should have this
      ],
      default: ['manage_users', 'manage_exams', 'view_results'],
    },

    // ── Activity Tracking ────────────────────────────────────────
    lastActiveAt: { type: Date },

    // ── Approved users list ──────────────────────────────────────
    approvedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    collection: 'admins',  // ✅ separate collection
  }
);

// ── Hooks & Methods ────────────────────────────────────────────────
applySharedHooks(adminSchema, () => Admin);
applySharedMethods(adminSchema);

// ── Admin-specific Methods ─────────────────────────────────────────

/** Admin can login once email & sms are verified */
adminSchema.methods.canLogin = function () {
  return this.isEmailVerified && this.isSmsVerified;
};

/** Check if admin has a specific permission */
adminSchema.methods.hasPermission = function (permission) {
  return this.isSuperAdmin || this.permissions.includes(permission);
};

/** Approve a user document */
adminSchema.methods.approveUser = async function (userDoc) {
  userDoc.isApproved = true;
  userDoc.approvedBy = this._id;
  userDoc.approvedAt = new Date();
  await userDoc.save();

  this.approvedUsers.push(userDoc._id);
  await this.save();
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;