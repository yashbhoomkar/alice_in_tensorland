const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  OTP: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

module.exports = mongoose.model("otpModel", otpSchema);
