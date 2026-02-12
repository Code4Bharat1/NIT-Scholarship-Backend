import express from "express";
import { getResults } from "../controllers/resultController.js";

const router = express.Router();

// GET RESULTS
router.get("/", getResults);

export default router;
