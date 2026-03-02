// models/examDate.model.js
import mongoose from 'mongoose';

// ✅ String type use karo — Date type UTC mein store hoti hai
// jisse IST (+5:30) mein ek din peeche ho jaata hai (timezone bug)
const examDateSchema = new mongoose.Schema({
  date1: { type: String, required: true }, // "YYYY-MM-DD" format
  date2: { type: String, required: true },
  date3: { type: String, required: true },
}, { timestamps: true });

const ExamDate = mongoose.model('ExamDate', examDateSchema);
export default ExamDate;
