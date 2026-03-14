import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema({
  fullName:      { type: String, required: true },
  email:         { type: String, required: true, unique: true },
  phone:         { type: String, required: true, unique: true },
  institution:   String,
  state:         String,
  city:          String,
  subCity:       String,
  preferredDate: String,
  photo:         String,
  tempPassword:  String,

  emailOTP:      String,
  smsOTP:        String,
  otpExpires:    Date,

  isEmailVerified: { type: Boolean, default: false },
  isSmsVerified:   { type: Boolean, default: false },
}, {
  timestamps: true,
  // ✅ Auto delete after 30 minutes if not verified
  expireAfterSeconds: 1800,
});

// TTL index — 30 min baad auto delete
pendingRegistrationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 });

export default mongoose.model("PendingRegistration", pendingRegistrationSchema);