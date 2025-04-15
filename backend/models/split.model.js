const mongoose = require("mongoose");

const splitSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Keep groups intact – here each split is associated with a group.
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      // required: true,
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        share: { type: Number, required: true, min: 0 },
        settled: { type: Boolean, default: false },
        settlementMethod: { type: String, enum: ["online", "offline"] },
        reminders: [Date],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Split", splitSchema);
