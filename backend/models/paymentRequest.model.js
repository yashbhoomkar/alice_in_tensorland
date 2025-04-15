const mongoose = require("mongoose");

const paymentRequestSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "expired"],
      default: "pending",
    },
    relatedTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    dueDate: {
      type: Date,
      validate: {
        validator: (v) => v > Date.now(),
        message: "Due date must be in the future",
      },
    },
    reminders: [Date],
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentRequest", paymentRequestSchema);
