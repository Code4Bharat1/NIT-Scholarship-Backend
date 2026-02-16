import Student from "../models/Student.js";

// ===============================
// SUBMIT EXAM
// ===============================
export const submitExam = async (req, res) => {
  try {
    const { studentId, marks, attendedQuestions, timeTaken } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Mongoose automatically converts string to ObjectId
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    student.marks = Number(marks) || 0;
    student.attendedQuestions = Number(attendedQuestions) || 0;
    student.timeTaken = Math.floor(Number(timeTaken) || 0);

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Exam submitted successfully",
      data: student,
    });
  } catch (error) {
    console.error("Submit Exam Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


// ===============================
// GET RESULTS
// ===============================
export const getResults = async (req, res) => {
  try {
    const { name, type } = req.query;

    let query = {};

    if (name) {
      query.username = { $regex: name, $options: "i" };
    }

    let students = await Student.find(query)
      .select("username marks attendedQuestions timeTaken")
      .lean();

    // Sort: Highest marks first, then lowest time
    students.sort((a, b) => {
      if ((b.marks || 0) !== (a.marks || 0)) {
        return (b.marks || 0) - (a.marks || 0);
      }
      return (a.timeTaken || 0) - (b.timeTaken || 0);
    });

    // Add rank
    const ranked = students.map((student, index) => ({
      ...student,
      rank: index + 1,
      displayTime: `${student.timeTaken || 0} sec`,
    }));

    if (type === "top") {
      return res.json(ranked.slice(0, 30));
    }

    if (type === "waiting") {
      return res.json(ranked.slice(30, 35));
    }

    return res.json(ranked);
  } catch (error) {
    console.error("Get Results Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch results",
    });
  }
};
