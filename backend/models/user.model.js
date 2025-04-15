const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    chatId: { type: String },
    mobile: { type: String, unique: true },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },
    name: {
      type: String,
    },
    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    ],
    splits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Split" }],
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "PaymentRequest" }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],

    // Current conversation state and raw input data for multi-step Telegram flows.
    currState: { type: String, default: "" },
    inProgressData: { type: Object, default: {} },

    // Summary tracking fields.
    totalOwed: { type: Number, default: 0 },
    totalLent: { type: Number, default: 0 },

    isVerified: { type: Boolean, default: false },
    failedAttempts: { type: Number, default: 0, min: 0 },
    lastAttempt: Date,
    status: {
      type: String,
      enum: ["active", "locked", "suspended"],
      default: "active",
    },
    currencyPreference: {
      type: String,
      enum: ["INR", "USD", "EUR", "GBP"],
      default: "INR",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
