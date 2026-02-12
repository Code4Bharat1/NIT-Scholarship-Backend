import express from "express";
import * as studentController from "../controllers/studentController.js";

const router = express.Router();

router.post("/register", studentController.registerStudent);
router.post("/login", studentController.loginStudent);
router.get("/", studentController.getStudents);
router.delete("/:id", studentController.deleteStudent);

export default router;
