const User = require("../models/user.model");
const TransactionController = require("../bot.controllers/transaction.controller");
const GroupController = require("../bot.controllers/group.controller");
const SplitController = require("../bot.controllers/split.controller");
const AuthController = require("../bot.controllers/auth.controller");
const ViewTransactionController = require("../bot.controllers/viewTransaction.controller");
const GeminiController = require("../bot.controllers/gemini.controller");
const BudgetController = TransactionController;
const logger = require("../config/logger");
const axios = require("axios");

class UserHandler {
  constructor(botToken) {
    this.botToken = botToken;
    this.controllers = {
      transaction: new TransactionController(this),
      group: new GroupController(this),
      auth: new AuthController(this),
      budget: new BudgetController(this),
      split: new SplitController(this), // Add this line
      viewTransactions: new ViewTransactionController(this), // Add this line
      gemini: new GeminiController(this),
    };
  }

  async handleMessage(message) {
    const chatId = message.chat.id;
    const text = (message.text || "").trim().toLowerCase();

    try {
      let user = await User.findOne({ chatId });
      console.log(user);

      if (text === "/start") {
        if (!user) {
          // New user
          user = await User.create({ chatId });
          user.currState = "AUTH:REGISTER_EMAIL";
          await user.save();
          return this.sendMessage(
            chatId,
            "👋 Welcome! Please share your email:",
            this.getCancelKeyboard()
          );
        }

        // Existing user - start login flow
        user.chatId = chatId;
        user.isVerified = false;
        await user.save();
        await this.controllers.auth.startLogin(user);
        return;
      }

      if (!user) {
        return this.sendMessage(
          chatId,
          "⚠️ Please start by sending /start to begin registration"
        );
      }

      console.log("after", user.currState);

      // if (user.currState === "INITMENU") return this.showMainMenu(chatId);

      if (text.startsWith("/")) return this.handleCommand(user, text);

      await this.handleStateInput(user, text);
    } catch (error) {
      logger.error("Message handling error:", error);
      this.sendMessage(chatId, "❌ Error processing request");
    }
  }

  async handleCommand(user, command) {
    const commandMap = {
      "/main": () => this.showMainMenu(user.chatId),
      "/add_expense": () => this.controllers.transaction.startAddExpense(user),
      "/split_expense": () => this.controllers.split.startSplitExpense(user),
      "/edit_expense": () =>
        this.controllers.transaction.startEditExpense(user),
      "/set_budget": () => this.controllers.budget.startSetBudget(user),
      "/create_group": () => this.controllers.group.startCreateGroup(user),
      "/view_transactions": () =>
        this.controllers.viewTransactions.showTimePeriodMenu(user),
      "/my_profile": () => this.controllers.auth.showProfile(user),
      "/reminders": () => this.controllers.transaction.showReminders(user),
      "/logout": () => this.controllers.auth.logoutUser(user),
      "/back": () => this.handleBackAction(user),
      "/cancel": () => this.resetUserState(user),
      "/budget_advice": () => this.controllers.gemini.startBudgetAdvice(user),
    };

    commandMap[command]
      ? await commandMap[command]()
      : this.sendMessage(
          user.chatId,
          "⚠️ Unknown command",
          this.getMainKeyboard()
        );
  }

  async handleStateInput(user, text) {
    const [flow] = user.currState?.split(":") || [];
    const handlerMap = {
      TRANSACTION: () => this.controllers.transaction.handleInput(user, text),
      GROUP: () => this.controllers.group.handleInput(user, text),
      BUDGET: () => this.controllers.budget.handleInput(user, text),
      AUTH: () => this.controllers.auth.handleInput(user, text),
      GEMINI: () => this.controllers.gemini.handleInput(user, text),
      SPLIT: () => this.controllers.split.handleInput(user, text),
      VIEW_TRANSACTIONS: () =>
        this.controllers.viewTransactions.handleInput(user, text),
    };

    handlerMap[flow]
      ? await handlerMap[flow]()
      : this.sendMessage(
          user.chatId,
          "❌ Invalid state",
          this.getMainKeyboard()
        );
  }

  async handleBackAction(user) {
    const [flow] = user.currState?.split(":") || [];
    const backHandlerMap = {
      TRANSACTION: () => this.controllers.transaction.handleBack(user),
      GROUP: () => this.controllers.group.handleBack(user),
      BUDGET: () => this.controllers.budget.handleBack(user),
      AUTH: () => this.controllers.auth.handleBack(user),
      SPLIT: () => this.controllers.split.handleBack(user),
      GEMINI: () => this.userHandler.resetUserState(user),
      VIEW_TRANSACTIONS: () =>
        this.controllers.viewTransactions.handleBack(user),
    };

    backHandlerMap[flow]
      ? await backHandlerMap[flow]()
      : this.showMainMenu(user.chatId);
  }

  async showMainMenu(chatId) {
    this.sendMessage(chatId, "🏠 Main Menu:", this.getMainKeyboard());
    // if (user.currState === "INITMENU") {
    //   user.currState = "";
    //   await user.save();
    // }
  }

  async sendMessage(chatId, text, replyMarkup) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          chat_id: chatId,
          text,
          reply_markup: replyMarkup,
        }
      );
    } catch (error) {
      logger.error("Message sending failed:", error);
    }
  }

  getMainKeyboard() {
    return {
      keyboard: [
        ["/add_expense", "/split_expense"],
        ["/edit_expense", "/set_budget"],
        ["/create_group", "/view_transactions"],
        ["/budget_advice", "/my_profile"],
        ["/reminders", "/logout"],
      ],
      resize_keyboard: true,
    };
  }

  getCancelKeyboard() {
    return {
      keyboard: [["/back", "/main"]],
      resize_keyboard: true,
    };
  }

  createKeyboard(options) {
    return {
      keyboard: [options],
      resize_keyboard: true,
    };
  }

  validateAmount(input) {
    return !isNaN(input) && parseFloat(input) > 0;
  }

  async resetUserState(user) {
    user.currState = "";
    user.inProgressData = {};
    await user.save();
  }
}

module.exports = UserHandler;
