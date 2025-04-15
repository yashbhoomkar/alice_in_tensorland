const express = require("express");
const {
  verifyOtp,
  sendOtp,
  updateUserDetails,
  verifyEmail,
  getUserDataById,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.get("/users/:userId/full-data", getUserDataById);
router.post("/verify-otp", verifyOtp);
router.post("/add-details", updateUserDetails);
router.post("/verifyemail", verifyEmail);
module.exports = router;
