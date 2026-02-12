import express from "express";
import * as studentController from "../controllers/studentController.js";
const router = express.Router();
import auth from "../middleware/studentauth.js";



router.post("/register", studentController.registerStudent);
router.post("/login", studentController.loginStudent);
router.get("/", studentController.getStudents);
router.delete("/:id", studentController.deleteStudent);
router.get("/profile", auth, studentController.getProfile);


export default router;
