const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    razorpayPaymentId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0.01 },
    currency: {
      type: String,
      required: true,
      enum: ["INR", "USD", "EUR", "GBP"],
    },
    method: {
      type: String,
      enum: ["card", "netbanking", "wallet", "upi", null],
    },
    status: {
      type: String,
      required: true,
      enum: ["created", "captured", "failed", "refunded"],
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    relatedTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
