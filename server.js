const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Make sure paths are correct
app.use("/api/students", require("./Routes/studentRoutes"));
app.use("/api/admin", require("./Routes/adminRoutes"));

app.listen(5000, () => console.log("Server running on port 5000"));
