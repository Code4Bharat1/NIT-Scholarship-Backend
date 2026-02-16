import Student from "../models/Student.js";

// ==========================
// SUBMIT EXAM FUNCTION
// ==========================
export const submitExam = async (req, res) => {
  try {
    const { studentId, marks, attendedQuestions, timeTaken } = req.body;

    console.log(req.body);

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Save exam data
    student.marks = marks ?? 0;
    student.attendedQuestions = attendedQuestions ?? 0;

    // ✅ Store time as simple number (seconds)
    student.timeTaken = Math.floor(timeTaken || 0);

    await student.save();

    res.status(200).json({
      success: true,
      message: "Exam submitted successfully",
    });
  } catch (error) {
    console.error("Submit Exam Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================
// GET RESULTS FUNCTION
// ==========================
export const getResults = async (req, res) => {
  try {
    const { name, type } = req.query;

    let query = {};

    if (name) {
      query.username = { $regex: name, $options: "i" };
    }

    let students = await Student.find(query).lean();

    // ADD TOTAL TIME + NORMALIZE
    students = students.map((s) => {
      const sec = s.timeTaken?.sec || 0;
      const ms = s.timeTaken?.ms || 0;
      const micro = s.timeTaken?.micro || 0;

      return {
        ...s,
        sec,
        ms,
        micro,
      };
    });

    // SORT LOGIC
    students.sort((a, b) => {
      if (b.marks !== a.marks) return b.marks - a.marks;
      if (a.sec !== b.sec) return a.sec - b.sec;
      if (a.ms !== b.ms) return a.ms - b.ms;
      return a.micro - b.micro;
    });

    // RANK + DISPLAY TIME LOGIC
    const ranked = students.map((s, index) => {
      let showTime = `${s.sec} sec`;

      const prev = students[index - 1];

      if (prev && prev.marks === s.marks && prev.sec === s.sec) {
        showTime = `${s.sec} sec ${s.ms} ms`;

        if (prev.ms === s.ms) {
          showTime = `${s.sec} sec ${s.ms} ms ${s.micro} micro`;
        }
      }

      return {
        ...s,
        rank: index + 1,
        displayTime: showTime,
      };
    });

    if (type === "top") return res.json(ranked.slice(0, 30));
    if (type === "waiting") return res.json(ranked.slice(30, 35));

    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch results" });
  }
};
