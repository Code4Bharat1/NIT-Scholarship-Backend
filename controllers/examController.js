import mongoose from "mongoose";
import Question from "../models/question.model.js";
import User from "../models/user.model.js";
import Result from "../models/result.model.js";

// @desc    Get exam questions (for student)
// @route   GET /api/exam/questions
// @access  Private/User (Approved & Can Take Exam)
export const getExamQuestions = async (req, res) => {
  try {
    // if (req.user.examAttempted) {
    //   return res.status(403).json({ success: false, message: 'You have already attempted the exam' });
    // }

    // Already completed exam
    if (req.user.examAttempted) {
      return res.status(403).json({
        success: false,
        message: "You have already completed the exam",
      });
    }

    // 🔥 NEW CHECK — exam already started
    if (req.user.examStartTime && !req.user.examAttempted) {
      return res.status(403).json({
        success: false,
        message: "Exam already started. Please continue your exam.",
      });
    }

    if (!req.user.canTakeExam) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Exam access not enabled. Please contact admin.",
        });
    }

    // const questions = await Question.find({ isActive: true })
    //   .select('-correctAnswer')
    //   .sort({ questionNumber: 1 })
    //   .limit(120);

    const questions = await Question.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 120 } }, // 🔥 RANDOM SELECT
      {
        $project: {
          correctAnswer: 0, // hide correct answer
        },
      },
    ]);

    if (questions.length < 120) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Not enough questions available. Please contact admin.",
        });
    }

    await User.findByIdAndUpdate(req.user.id, { examStartTime: new Date() });

    res.status(200).json({
      success: true,
      count: questions.length,
      examDuration: 60,
      data: { questions },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching exam questions",
        error: error.message,
      });
  }
};

// @desc    Submit exam
// @route   POST /api/exam/submit
// @access  Private/User (Approved & Can Take Exam)
export const submitExam = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide answers array" });
    }

    const invalidIds = answers.filter(
      (a) => !a.questionId || !mongoose.Types.ObjectId.isValid(a.questionId),
    );
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid questionId(s). Use real _id values from GET /api/exam/questions",
        invalidIds: invalidIds.map((a) => a.questionId),
      });
    }

    if (req.user.examAttempted) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You have already attempted the exam",
        });
    }

    const user = await User.findById(req.user.id);

    if (!user.examStartTime) {
      return res
        .status(400)
        .json({ success: false, message: "Exam not started" });
    }

    const examSubmittedAt = new Date();
    const examStartedAt = user.examStartTime;
    const timeTaken = Math.floor((examSubmittedAt - examStartedAt) / 1000);

    if (timeTaken > 7200) {
      return res
        .status(403)
        .json({ success: false, message: "Time limit exceeded" });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q._id.toString()] = {
        correctAnswer: q.correctAnswer,
        questionNumber: q.questionNumber,
      };
    });

    // Evaluate answers
    const evaluatedAnswers = answers.map((answer) => {
      const question = questionMap[answer.questionId];
      const isCorrect = answer.selectedAnswer === question.correctAnswer;

      return {
        questionId: answer.questionId,
        questionNumber: question.questionNumber,
        selectedAnswer: answer.selectedAnswer || null,
        correctAnswer: question.correctAnswer,
        isCorrect,
        timeTakenForQuestion: answer.timeTakenForQuestion || 0,
      };
    });

    // ✅ Calculate scores
    const totalMarks = 120;
    const marksObtained = evaluatedAnswers.filter((a) => a.isCorrect).length;
    const percentage = parseFloat(
      ((marksObtained / totalMarks) * 100).toFixed(2),
    );

    // Create result
    const result = await Result.create({
      user: req.user.id,
      examStartedAt,
      examSubmittedAt,
      timeTaken,
      answers: evaluatedAnswers,
      totalQuestions: 120,
      totalMarks,
      marksObtained,
      percentage,
    });

    user.examAttempted = true;
    user.examEndTime = examSubmittedAt;
    user.canTakeExam = false;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Exam submitted successfully",
      data: {
        resultId: result._id,
        marksObtained: result.marksObtained,
        totalMarks: result.totalMarks,
        percentage: result.percentage,
        questionsAttempted: result.questionsAttempted,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.wrongAnswers,
      },
    });
  } catch (error) {
    console.error("Submit exam error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error submitting exam",
        error: error.message,
      });
  }
};

// @desc    Get user's exam result
// @route   GET /api/exam/result
// @access  Private/User
export const getMyResult = async (req, res) => {
  try {
    const result = await Result.findOne({ user: req.user.id }).populate({
      path: "user",
      select: "fullName email registrationNumber",
    });

    if (!result) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Result not found. You may not have attempted the exam yet.",
        });
    }

    //  RESULT NOT PUBLISHED CHECK
if (!result.resultPublished) {
  return res.status(403).json({
    success: false,
    message: "Result has not been published yet",
  });
}


    const rank =
      (await Result.countDocuments({
        $or: [
          { marksObtained: { $gt: result.marksObtained } },
          {
            marksObtained: result.marksObtained,
            timeTaken: { $lt: result.timeTaken },
          },
        ],
      })) + 1;

    result.rank = rank;
    await result.save();

    res.status(200).json({ success: true, data: { result } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching result",
        error: error.message,
      });
  }
};

// @desc    Get exam status
// @route   GET /api/exam/status
// @access  Private/User
export const getExamStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        canTakeExam: user.canTakeExam,
        examAttempted: user.examAttempted,
        examStartTime: user.examStartTime,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching exam status",
        error: error.message,
      });
  }
};

export default { getExamQuestions, submitExam, getMyResult, getExamStatus };
