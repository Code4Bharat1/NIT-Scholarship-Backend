import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    unique: true,   // No duplicate states
    trim: true
  },
  cities: [
    {
      type: String,
      trim: true
    }
  ]
}, { timestamps: true });

export default mongoose.model("Location", locationSchema);