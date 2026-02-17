import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: [
    {
      optionKey: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D']
      },
      optionText: {
        type: String,
        required: true,
        trim: true
      }
    }
  ],
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    enum: ['A', 'B', 'C', 'D']
  },
  subject: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  marks: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  questionNumber: {
    type: Number,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

// ✅ No next() — throw error directly, Mongoose handles it
questionSchema.pre('validate', function () {
  if (this.options.length !== 4) {
    throw new Error('Each question must have exactly 4 options (A, B, C, D)');
  }
});

const Question = mongoose.model('Question', questionSchema);

export default Question;