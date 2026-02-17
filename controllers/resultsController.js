import Result from '../models/result.model.js';
import User from '../models/user.model.js';

// @desc    Get all results with rankings
// @route   GET /api/admin/results
// @access  Private/Admin
export const getAllResults = async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'rank' } = req.query;

    let sortOption = {};
    
    // Sort options
    switch (sortBy) {
      case 'rank':
        sortOption = { marksObtained: -1, timeTaken: 1 };
        break;
      case 'marks':
        sortOption = { marksObtained: -1 };
        break;
      case 'time':
        sortOption = { timeTaken: 1 };
        break;
      case 'recent':
        sortOption = { examSubmittedAt: -1 };
        break;
      default:
        sortOption = { marksObtained: -1, timeTaken: 1 };
    }

    const results = await Result.find()
      .populate({
        path: 'user',
        select: 'fullName email registrationNumber phone institution'
      })
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Calculate ranks for all results
    for (let i = 0; i < results.length; i++) {
      const rank = await Result.countDocuments({
        $or: [
          { marksObtained: { $gt: results[i].marksObtained } },
          {
            marksObtained: results[i].marksObtained,
            timeTaken: { $lt: results[i].timeTaken }
          }
        ]
      }) + 1;

      if (results[i].rank !== rank) {
        results[i].rank = rank;
        await results[i].save();
      }
    }

    const count = await Result.countDocuments();

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: { results }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching results',
      error: error.message
    });
  }
};

// @desc    Get top rankers (leaderboard)
// @route   GET /api/admin/results/leaderboard
// @access  Private/Admin
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const topRankers = await Result.find()
      .populate({
        path: 'user',
        select: 'fullName registrationNumber institution'
      })
      .sort({ marksObtained: -1, timeTaken: 1 })
      .limit(parseInt(limit));

    // Update ranks
    for (let i = 0; i < topRankers.length; i++) {
      topRankers[i].rank = i + 1;
      await topRankers[i].save();
    }

    res.status(200).json({
      success: true,
      count: topRankers.length,
      data: { leaderboard: topRankers }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
};

// @desc    Get result by ID (detailed view)
// @route   GET /api/admin/results/:id
// @access  Private/Admin
export const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate({
      path: 'user',
      select: 'fullName email registrationNumber phone institution'
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Populate question details in answers
    await result.populate({
      path: 'answers.questionId',
      select: 'questionText options subject difficulty'
    });

    res.status(200).json({
      success: true,
      data: { result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching result details',
      error: error.message
    });
  }
};

// @desc    Get result by user ID
// @route   GET /api/admin/results/user/:userId
// @access  Private/Admin
export const getResultByUserId = async (req, res) => {
  try {
    const result = await Result.findOne({ user: req.params.userId }).populate({
      path: 'user',
      select: 'fullName email registrationNumber phone institution'
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: { result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user result',
      error: error.message
    });
  }
};

// @desc    Get results statistics
// @route   GET /api/admin/results/stats
// @access  Private/Admin
export const getResultsStats = async (req, res) => {
  try {
    const totalResults = await Result.countDocuments();
    
    // Average statistics
    const stats = await Result.aggregate([
      {
        $group: {
          _id: null,
          avgMarks: { $avg: '$marksObtained' },
          avgPercentage: { $avg: '$percentage' },
          avgTimeTaken: { $avg: '$timeTaken' },
          avgQuestionsAttempted: { $avg: '$questionsAttempted' },
          maxMarks: { $max: '$marksObtained' },
          minMarks: { $min: '$marksObtained' }
        }
      }
    ]);

    // Pass rate (assuming passing marks is 40%)
    const passCount = await Result.countDocuments({ percentage: { $gte: 40 } });
    const passPercentage = totalResults > 0 ? (passCount / totalResults) * 100 : 0;

    // Score distribution
    const scoreDistribution = await Result.aggregate([
      {
        $bucket: {
          groupBy: '$percentage',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            students: { $push: '$user' }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalResults,
        passCount,
        passPercentage: passPercentage.toFixed(2),
        statistics: stats[0] || {},
        scoreDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching results statistics',
      error: error.message
    });
  }
};

// @desc    Export results to CSV
// @route   GET /api/admin/results/export
// @access  Private/Admin
export const exportResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate({
        path: 'user',
        select: 'fullName email registrationNumber phone institution'
      })
      .sort({ marksObtained: -1, timeTaken: 1 });

    // Create CSV data
    let csvData = 'Rank,Registration Number,Name,Email,Phone,Institution,Marks Obtained,Total Marks,Percentage,Questions Attempted,Correct Answers,Wrong Answers,Time Taken (seconds),Exam Date\n';

    results.forEach((result, index) => {
      const rank = index + 1;
      const row = [
        rank,
        result.user?.registrationNumber || 'N/A',
        result.user?.fullName || 'N/A',
        result.user?.email || 'N/A',
        result.user?.phone || 'N/A',
        result.user?.institution || 'N/A',
        result.marksObtained,
        result.totalMarks,
        result.percentage,
        result.questionsAttempted,
        result.correctAnswers,
        result.wrongAnswers,
        result.timeTaken,
        new Date(result.examSubmittedAt).toLocaleString()
      ].join(',');
      
      csvData += row + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=exam_results.csv');
    res.status(200).send(csvData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting results',
      error: error.message
    });
  }
};

export default {
  getAllResults,
  getLeaderboard,
  getResultById,
  getResultByUserId,
  getResultsStats,
  exportResults
};