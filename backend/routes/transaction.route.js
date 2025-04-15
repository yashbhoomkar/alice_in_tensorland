const express = require("express");
const {
  getAllTransactions,
  getTransactionById,
  addExpense,
  addIncome,
  getAllExpense,
  getAllIncome,
  getUserTransactionSummary,
} = require("../controllers/transaction.controller");

const router = express.Router();

router.post("/", getAllTransactions);
router.get("/:id", getTransactionById);

router.post("/expense", addExpense);
router.post("/getallincome", getAllIncome);
router.post("/getallexpense", getAllExpense);
router.post("/getdata", getUserTransactionSummary);
router.post("/income", addIncome);

module.exports = router;
