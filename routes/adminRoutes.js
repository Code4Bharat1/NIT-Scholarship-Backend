import express from "express";
import { registerAdmin, loginAdmin, sendEmail } from "../controllers/adminController.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/send-email", sendEmail);

export default router;
