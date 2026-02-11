// Routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.post("/register", studentController.registerStudent);
router.post("/login", studentController.loginStudent);
router.get("/", studentController.getStudents);
router.delete("/:id", studentController.deleteStudent); // ← add this
module.exports = router;
