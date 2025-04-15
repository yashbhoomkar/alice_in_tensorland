const mongoose = require("mongoose");
const axios = require("axios");

const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    description: { type: String, maxlength: 200 },
    date: { type: Date, default: Date.now, index: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true, index: true },

    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", index: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    splitType: { type: String, enum: ["personal", "group"] },
    splits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Split" }],
    currency: {
      type: String,
    },
    isSettled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// transactionSchema.post("save", async function (doc) {
//   try {
//     if (doc.type === "expense") {
//       const userId = doc.createdBy;

//       // Aggregate total income and expense for the user
//       const result = await mongoose.model("Transaction").aggregate([
//         { $match: { createdBy: userId } },
//         {
//           $group: {
//             _id: "$type",
//             total: { $sum: "$amount" },
//           },
//         },
//       ]);

//       let totalIncome = 0;
//       let totalExpense = 0;
//       result.forEach((res) => {
//         if (res._id === "income") totalIncome = res.total;
//         if (res._id === "expense") totalExpense = res.total;
//       });

//       // Check if expenses exceed 80% of income
//       if (totalExpense > totalIncome * 0.8) {
//         const user = await mongoose.model("User").findById(userId);
//         if (user?.chatId) {
//           const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
//           await axios.post(
//             `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
//             {
//               chat_id: user.chatId,
//               text: ` Financial Alert: Your total expenses (${totalExpense}) exceed 80% of your total income (${totalIncome}). Please review your spending habits.`,
//             }
//           );
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error processing transaction alert:", error);
//   }
// });

module.exports = mongoose.model("Transaction", transactionSchema);
