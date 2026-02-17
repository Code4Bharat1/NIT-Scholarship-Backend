import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One feedback per user
  },

  // Overall Experience
  overallExperience: {
    type: Number,
    required: [true, 'Overall experience rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5']
  },

  // Exam Interface Rating
  examInterfaceRating: {
    type: Number,
    min: 1,
    max: 5
  },

  // Difficulty Level (student's perception)
  examDifficulty: {
    type: String,
    enum: ['very_easy', 'easy', 'moderate', 'hard', 'very_hard']
  },

  // Was the exam fair?
  wasExamFair: {
    type: Boolean
  },

  // Technical Issues faced
  facedTechnicalIssues: {
    type: Boolean,
    default: false
  },
  technicalIssueDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Technical issue description cannot exceed 500 characters']
  },

  // Suggestions
  suggestions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Suggestions cannot exceed 1000 characters']
  },

  // Any other comments
  comments: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comments cannot exceed 1000 characters']
  },

  // Would they recommend this scholarship?
  wouldRecommend: {
    type: Boolean
  }
}, {
  timestamps: true
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;