const Transaction = require("../models/transaction.model");
const mongoose = require("mongoose");


exports.getAllTransactions = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const transactions = await Transaction.find({ createdBy: userId })
      .populate("createdBy", "name email")
      .populate("splits");

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAllIncome = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const incomeTransactions = await Transaction.find({
      type: "income",
      createdBy: userId,
    }).sort({ date: -1 });

    res.status(200).json(incomeTransactions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch income transactions" });
  }
};


exports.getAllExpense = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const expenseTransactions = await Transaction.find({
      type: "expense",
      createdBy: userId,
    }).sort({ date: -1 });

    res.status(200).json(expenseTransactions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expense transactions" });
  }
};



exports.getTransactionById = async (req, res) => {
  try {
    console.log("Transaction ID:", req.params.id);

    const transaction = await Transaction.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("splits");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.addExpense = async (req, res) => {
  try {
    const { amount, description, category, createdBy, splitType, splits } =
      req.body;

    if (!amount || !category || !createdBy || !splitType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newExpense = new Transaction({
      amount,
      description,
      category,
      createdBy,
      splitType,
      splits,
      type: "expense",
    });

    await newExpense.save();
    res.status(201).json({ message: "Expense added successfully", newExpense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.addIncome = async (req, res) => {
  try {
    const { amount, description, category, createdBy, splitType, splits } =
      req.body;

    if (!amount || !category || !createdBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newIncome = new Transaction({
      amount,
      description,
      category,
      createdBy,
    
      type: "income",
    });

    await newIncome.save();
    res.status(201).json({ message: "Income added successfully", newIncome });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getUserTransactionSummary = async (req, res) => {
  try {
   
    const userId = req.body.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const summary = await Transaction.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    summary.forEach((entry) => {
      if (entry._id === "income") {
        totalIncome = entry.totalAmount;
      } else if (entry._id === "expense") {
        totalExpense = entry.totalAmount;
      }
    });

    return res.json({ totalIncome, totalExpense });
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
