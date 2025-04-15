const { GoogleGenerativeAI } = require("@google/generative-ai");
const Transaction = require("../models/transaction.model");
const logger = require("../config/logger");
const { DateTime } = require("luxon");

const SYSTEM_PROMPT = `
You are a friendly personal financial advisor called BudgetBuddy. and answer questions from context and must provide answers (ACCURATE) Your role is to:
Ensure you start with greeting with username

1. Analyze users' transaction history with empathy
2. Provide actionable budgeting advice in simple language
3. Identify spending patterns and potential savings
4. Suggest realistic financial goals
5. Always maintain positive and encouraging tone
6. Answer in Depth when asked
7. Make sure answer should be some compact but showing all information
8. answer bullet pointwise
9. Also make sure you are helping to minimize expense
10. Also provide Tip whenever required
11. when ask to plan then need proper formatted bulletwise

Guidelines:
- Use ₹ symbol for currency (default)
- Use emojis sparingly for emphasis
- Reference specific transaction categories when possible
- Always confirm if user needs clarification
`;

class GeminiController {
  constructor(userHandler) {
    this.userHandler = userHandler;
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async startBudgetAdvice(user) {
    try {
      const transactions = await Transaction.find({ createdBy: user._id })
        .populate("group")
        .populate({
          path: "splits",
          populate: [
            { path: "paidBy", select: "name" },
            { path: "participants.user", select: "name" },
            { path: "group", select: "name" },
          ],
        })
        .sort({ date: -1 })
        .lean();

      user.currState = "GEMINI:ADVICE";
      user.inProgressData = {
        geminiHistory: [],
        transactions: this._formatTransactions(transactions),
        currency: user.currencyPreference || "INR",
      };
      await user.save();

      const keyboard = {
        keyboard: [["/stop", "/main"]],
        resize_keyboard: true,
      };

      this.userHandler.sendMessage(
        user.chatId,
        "💡 What financial advice would you like today?\nExamples:\n- Where am I overspending?\n- How can I save more?\n- Monthly budget breakdown",
        keyboard
      );
    } catch (error) {
      logger.error("Budget advice setup failed:", error);
      this.userHandler.sendMessage(
        user.chatId,
        "❌ Failed to load financial data. Please try later.",
        this.userHandler.getMainKeyboard()
      );
      this.userHandler.resetUserState(user);
    }
  }

  async handleInput(user, text) {
    if (text.toLowerCase() === "/stop") {
      this.userHandler.sendMessage(
        user.chatId,
        "🛑 Budget advice session ended.",
        this.userHandler.getMainKeyboard()
      );
      return this.userHandler.resetUserState(user);
    }

    try {
      const response = await this._getGeminiResponse(user, text);
      user.inProgressData.geminiHistory.push(
        { role: "user", parts: [{ text }] },
        { role: "model", parts: [{ text: response }] }
      );
      await user.save();

      this.userHandler.sendMessage(
        user.chatId,
        response,
        { parse_mode: null } // Disable Markdown parsing
      );
    } catch (error) {
      logger.error("Gemini interaction failed:", error);
      this.userHandler.sendMessage(
        user.chatId,
        "❌ Error processing your request. Session ended.",
        this.userHandler.getMainKeyboard()
      );
      this.userHandler.resetUserState(user);
    }
  }

  async _getGeminiResponse(user, message) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const chat = model.startChat({
      systemInstruction: {
        role: "system",
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\n# USER TRANSACTIONS\n${user.inProgressData.transactions}`,
          },
        ],
      },
      history: user.inProgressData.geminiHistory,
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        topK: 50,
        maxOutputTokens: 800,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response.text();
    return this._sanitizeResponse(response);
  }

  _sanitizeResponse(text) {
    return text
      .replace(/```/g, "") // Remove code blocks
      .replace(/\*\*/g, "") // Remove bold markers
      .replace(/\*/g, "") // Remove italics markers
      .replace(/`/g, "") // Remove inline code
      .trim();
  }

  _formatTransactions(transactions) {
    return transactions
      .map(
        (t) =>
          `Date: ${DateTime.fromJSDate(t.date).toFormat("dd LLL yyyy")}\n` +
          `Type: ${t.type.toUpperCase()} - ${t.category}\n` +
          `Amount: ${t.amount.toFixed(2)} ${t.currency}\n` +
          (t.description ? `Note: ${t.description}\n` : "") +
          (t.group ? `Group: ${t.group.name}\n` : "") +
          (t.splits?.length
            ? `Split Details:\n${t.splits
                .map(
                  (split) =>
                    `Paid by: ${split.paidBy.name}\n` +
                    `Participants:\n${split.participants
                      .map(
                        (p) =>
                          `${p.user.name}: ${p.share}% ${
                            p.settled ? "(Settled)" : "(Pending)"
                          }`
                      )
                      .join("\n")}`
                )
                .join("\n")}\n`
            : "")
      )
      .join("\n\n");
  }
}

module.exports = GeminiController;
