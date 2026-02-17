import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Exam Details
  examStartedAt: {
    type: Date,
    required: true
  },
  examSubmittedAt: {
    type: Date,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  
  // Answers
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    questionNumber: {
      type: Number,
      required: true
    },
    selectedAnswer: {
      type: String,
      enum: ['A', 'B', 'C', 'D', null],
      default: null
    },
    correctAnswer: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    timeTakenForQuestion: {
      type: Number, // in seconds
      default: 0
    }
  }],
  
  // Score Details
  totalQuestions: {
    type: Number,
    required: true,
    default: 120
  },
  questionsAttempted: {
    type: Number,
    required: true,
    default: 0
  },
  questionsNotAttempted: {
    type: Number,
    required: true,
    default: 0
  },
  correctAnswers: {
    type: Number,
    required: true,
    default: 0
  },
  wrongAnswers: {
    type: Number,
    required: true,
    default: 0
  },
  totalMarks: {
    type: Number,
    required: true
  },
  marksObtained: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  
  // Ranking
  rank: {
    type: Number
  },
  
  // Status
  status: {
    type: String,
    enum: ['submitted', 'evaluated'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

// Calculate statistics before saving
resultSchema.pre('save', function() {
  if (this.isNew) {
    this.questionsAttempted = this.answers.filter(a => a.selectedAnswer !== null).length;
    this.questionsNotAttempted = this.totalQuestions - this.questionsAttempted;
    this.correctAnswers = this.answers.filter(a => a.isCorrect).length;
    this.wrongAnswers = this.questionsAttempted - this.correctAnswers;
    this.marksObtained = this.correctAnswers;
    this.totalMarks = this.totalQuestions;
    this.percentage = parseFloat(((this.marksObtained / this.totalMarks) * 100).toFixed(2)); // ✅ parseFloat keeps it a Number
  }
});

// Calculate time taken
resultSchema.methods.calculateTimeTaken = function() {
  const diff = this.examSubmittedAt - this.examStartedAt;
  this.timeTaken = Math.floor(diff / 1000); // Convert to seconds
};

// Index for faster ranking queries
resultSchema.index({ marksObtained: -1, timeTaken: 1 });

const Result = mongoose.model('Result', resultSchema);

export default Result;