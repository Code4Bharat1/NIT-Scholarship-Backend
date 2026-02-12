import jwt from "jsonwebtoken";

const verifyStudent = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Expecting: Bearer <token>
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.student = decoded; // attach student info to request
    next();

  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

export default verifyStudent;
