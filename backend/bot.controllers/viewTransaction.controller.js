// backend/bot.controllers/viewTransaction.controller.js
const Transaction = require("../models/transaction.model");
const logger = require("../config/logger");
const { DateTime } = require("luxon");

class ViewTransactionController {
  constructor(userHandler) {
    this.userHandler = userHandler;
    this.itemsPerPage = 5;
    this.dateRanges = {
      "Last Month": () => ({
        start: DateTime.now().minus({ months: 1 }).startOf("month"),
        end: DateTime.now().minus({ months: 1 }).endOf("month"),
      }),
      "Last 6 Months": () => ({
        start: DateTime.now().minus({ months: 6 }).startOf("month"),
        end: DateTime.now().endOf("day"),
      }),
      "Last Year": () => ({
        start: DateTime.now().minus({ years: 1 }).startOf("year"),
        end: DateTime.now().endOf("year"),
      }),
      "All Time": () => ({
        start: DateTime.fromJSDate(new Date(0)),
        end: DateTime.now().endOf("day"),
      }),
    };
  }

  async showTimePeriodMenu(user) {
    user.currState = "VIEW_TRANSACTIONS:PERIOD_SELECT";
    await user.save();

    const keyboard = {
      keyboard: [
        ["Last Month", "Last 6 Months"],
        ["Last Year", "All Time"],
        ["/back"],
      ],
      resize_keyboard: true,
    };

    this.userHandler.sendMessage(
      user.chatId,
      "📅 Select time period:",
      keyboard
    );
  }

  async handleTimePeriodSelection(user, input) {
    // Normalize input to match keyboard options
    const period = input
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    if (!this.dateRanges[period]) {
      this.userHandler.sendMessage(
        user.chatId,
        "⚠️ Invalid period selection. Please use the buttons.",
        this.userHandler.getMainKeyboard()
      );
      return this.userHandler.resetUserState(user);
    }

    const range = this.dateRanges[period]();
    user.inProgressData = {
      period,
      currentPage: 1,
      startDate: range.start.toUTC().toJSDate(),
      endDate: range.end.toUTC().toJSDate(),
    };

    user.currState = "VIEW_TRANSACTIONS:LIST";
    await user.save();

    return this.showTransactionPage(user);
  }

  async showTransactionPage(user) {
    const { startDate, endDate, currentPage } = user.inProgressData;
    const skip = (currentPage - 1) * this.itemsPerPage;

    try {
      const transactions = await Transaction.find({
        createdBy: user._id,
        date: { $gte: startDate, $lte: endDate },
      })
        .sort({ date: -1 })
        .skip(skip)
        .limit(this.itemsPerPage)
        .populate("group", "name")
        .lean();

      const totalCount = await Transaction.countDocuments({
        createdBy: user._id,
        date: { $gte: startDate, $lte: endDate },
      });

      const totalPages = Math.ceil(totalCount / this.itemsPerPage);

      if (transactions.length === 0) {
        this.userHandler.sendMessage(
          user.chatId,
          "📭 No transactions found for selected period.",
          this.userHandler.getMainKeyboard()
        );
        return this.userHandler.resetUserState(user);
      }

      user.inProgressData.totalPages = totalPages;
      user.markModified("inProgressData");
      await user.save();

      let message = `📜 Transactions (${user.inProgressData.period} - Page ${currentPage}/${totalPages}):\n\n`;
      transactions.forEach((t, i) => {
        message += `${i + 1}. ${DateTime.fromJSDate(t.date).toFormat(
          "dd LLL yyyy"
        )}\n`;
        message += `   ${t.description}\n`;
        message += `   Amount: ${t.amount.toFixed(2)} ${t.currency || ""}\n`;
        message += `   Type: ${
          t.type.charAt(0).toUpperCase() + t.type.slice(1)
        } (${t.category})`;
        message += t.group ? `\n   Group: ${t.group.name}` : "";
        message += "\n\n";
      });

      const keyboard = {
        keyboard: [
          [{ text: "⬅️ Previous" }, { text: "➡️ Next" }],
          ["/back", "/main"],
        ],
        resize_keyboard: true,
      };

      this.userHandler.sendMessage(user.chatId, message, keyboard);
    } catch (error) {
      logger.error("Transaction fetch error:", error);
      this.userHandler.sendMessage(
        user.chatId,
        "❌ Failed to fetch transactions. Please try again.",
        this.userHandler.getMainKeyboard()
      );
      this.userHandler.resetUserState(user);
    }
  }

  async handlePagination(user, direction) {
    let { currentPage, totalPages } = user.inProgressData;
    console.log(currentPage, totalPages);
    if (direction === "next" && currentPage < totalPages) {
      currentPage++;
    } else if (direction === "prev" && currentPage > 1) {
      currentPage--;
    } else {
      return this.showTransactionPage(user);
    }
    console.log(currentPage, totalPages);

    user.inProgressData.currentPage = currentPage;
    user.markModified("inProgressData");
    await user.save();
    return this.showTransactionPage(user);
  }

  async handleInput(user, text) {
    try {
      const stateParts = user.currState.split(":");
      console.log(text);
      switch (stateParts[1]) {
        case "PERIOD_SELECT":
          return this.handleTimePeriodSelection(user, text);

        case "LIST":
          if (text === "➡️ Next".toLowerCase())
            return this.handlePagination(user, "next");
          if (text === "⬅️ Previous".toLowerCase())
            return this.handlePagination(user, "prev");
          if (text === "/back") return this.showTimePeriodMenu(user);
          break;
      }

      this.userHandler.sendMessage(
        user.chatId,
        "⚠️ Please use the provided buttons for navigation.",
        this.userHandler.getMainKeyboard()
      );
      return this.userHandler.resetUserState(user);
    } catch (error) {
      logger.error("ViewTransactions handling error:", error);
      this.userHandler.sendMessage(
        user.chatId,
        "❌ Error processing your request. Returning to main menu.",
        this.userHandler.getMainKeyboard()
      );
      this.userHandler.resetUserState(user);
    }
  }

  async handleBack(user) {
    const stateParts = user.currState.split(":");

    if (stateParts[1] === "LIST") {
      return this.showTimePeriodMenu(user);
    }

    this.userHandler.showMainMenu(user.chatId);
    return this.userHandler.resetUserState(user);
  }
}

module.exports = ViewTransactionController;
