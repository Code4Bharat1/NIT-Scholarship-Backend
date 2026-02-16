import express from "express";
import { submitExam, getResults } from "../controllers/examController.js";

const router = express.Router();

router.post("/submit-exam", submitExam);
router.get("/results", getResults);

export default router;
