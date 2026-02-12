import Student from "../models/Student.js";

export const getResults = async (req, res) => {
  try {
    const { name } = req.query;

    let query = {};

    // search by name
    if (name) {
      query.username = { $regex: name, $options: "i" };
    }

    const students = await Student.find(query);

    // 🔥 ranking logic
    students.sort((a, b) => {
      if (b.marks !== a.marks) return b.marks - a.marks;
      return a.timeTaken - b.timeTaken;
    });

    const ranked = students.map((s, index) => ({
      ...s._doc,
      rank: index + 1,
    }));

    res.json(ranked);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch results" });
  }
};
