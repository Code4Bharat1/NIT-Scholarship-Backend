import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import studentRoutes from "./Routes/studentRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";
import resultRoutes from "./Routes/resultRoutes.js";
import otpRoutes from "./Routes/otpRoutes.js";
import examRoutes from "./Routes/examRoutes.js";




dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/exams", examRoutes);



app.listen(5000, () => console.log("Server running on port 5000"));
