const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../controllers/adminController");
const { sendEmail } = require("../controllers/adminController");




router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/send-email", sendEmail);

module.exports = router;
