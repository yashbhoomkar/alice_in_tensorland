const mongoose = require("mongoose");
const Split = require("../models/split.model");
const Transaction = require("../models/transaction.model");
const Group = require("../models/group.model");
const User = require("../models/user.model");
const logger = require("../config/logger");

class SplitController {
  constructor(handler) {
    this.handler = handler;
    this.SPLIT_TYPES = ["EQUAL", "PERCENTAGE", "EXACT"];
    this.CURRENCIES = ["INR", "USD", "EUR", "GBP"];
    this.CATEGORIES = [
      "🍔 Food & Dining",
      "🚕 Transportation",
      "🏠 Housing",
      "💡 Utilities",
      "🎉 Entertainment",
      "🏥 Healthcare",
      "🎓 Education",
      "🛍️ Shopping",
      "✈️ Travel",
      "💅 Personal Care",
      "🎁 Gifts & Donations",
      "❓ Other",
    ];
  }

  async startSplitExpense(user) {
    user.currState = "SPLIT:CURRENCY";
    await user.save();
    this.handler.sendMessage(
      user.chatId,
      "🌍 Select currency for your split expense:",
      this.createCurrencyKeyboard()
    );
  }

  async handleInput(user, text) {
    const [, step] = user.currState.split(":");
    const handlers = {
      CURRENCY: () => this.handleCurrency(user, text),
      AMOUNT: () => this.handleAmount(user, text),
      DESCRIPTION: () => this.handleDescription(user, text),
      CATEGORY: () => this.handleCategory(user, text),
      SPLIT_TYPE: () => this.handleSplitType(user, text),
      SELECT_SOURCE: () => this.handleSourceSelection(user, text),
      GROUP_SELECT: () => this.handleGroupSelect(user, text),
      MANUAL_PARTICIPANTS: () => this.handleManualParticipants(user, text),
      SHARES: () => this.handleShares(user, text),
    };
    return handlers[step]?.();
  }

  async handleCurrency(user, text) {
    const currency = text.toUpperCase().replace(/[^A-Z]/g, "");
    console.log(text);
    if (!this.CURRENCIES.includes(currency)) {
      return this.handler.sendMessage(
        user.chatId,
        "⚠️ Please select a valid currency from the options:",
        this.createCurrencyKeyboard()
      );
    }
    user.inProgressData = { currency };
    user.markModified("inProgressData");
    user.currState = "SPLIT:AMOUNT";
    await user.save();
    this.handler.sendMessage(
      user.chatId,
      "💸 Enter the total amount to split:",
      this.handler.getCancelKeyboard()
    );
  }

  async handleAmount(user, text) {
    const amount = parseFloat(text.replace(/[^0-9.]/g, ""));
    if (isNaN(amount) || amount <= 0) {
      return this.handler.sendMessage(
        user.chatId,
        "⚠️ Please enter a valid positive number:",
        this.handler.getCancelKeyboard()
      );
    }
    user.inProgressData.amount = amount;
    user.markModified("inProgressData");
    user.currState = "SPLIT:DESCRIPTION";
    await user.save();
    this.handler.sendMessage(
      user.chatId,
      "📝 Describe this expense (e.g., 'Dinner at Taj Hotel'):",
      this.handler.getCancelKeyboard()
    );
  }

  async handleDescription(user, text) {
    if (text.length < 3) {
      return this.handler.sendMessage(
        user.chatId,
        "⚠️ Description too short. Please provide more details:",
        this.handler.getCancelKeyboard()
      );
    }
    user.inProgressData.description = text;
    user.markModified("inProgressData");
    user.currState = "SPLIT:CATEGORY";
    await user.save();
    this.handler.sendMessage(
      user.chatId,
      "📦 Select expense category:",
      this.createCategoryKeyboard()
    );
  }

  async handleCategory(user, text) {
    const cleanText = text.toUpperCase().replace(/[^a-zA-Z& ]/g, "");
    console.log(text, cleanText);
    if (!this.CATEGORIES.some((c) => c.toUpperCase().includes(cleanText))) {
      return this.handler.sendMessage(
        user.chatId,
        "⚠️ Please select a valid category:",
        this.createCategoryKeyboard()
      );
    }
    user.inProgressData.category = cleanText.replace(/.* /, "");
    user.markModified("inProgressData");
    user.currState = "SPLIT:SPLIT_TYPE";
    await user.save();
    this.handler.sendMessage(
      user.chatId,
      "🔀 How would you like to split this expense?",
      this.createSplitTypeKeyboard()
    );
  }

  async handleSplitType(user, text) {
    const splitType = text.toUpperCase().replace(/[^A-Z]/g, "");
    if (!this.SPLIT_TYPES.includes(splitType)) {
      return this.handler.sendMessage(
        user.chatId,
        "⚠️ Please select a valid split type:",
        this.createSplitTypeKeyboard()
      );
    }
    user.inProgressData.splitType = splitType;
    user.markModified("inProgressData");
    user.currState = "SPLIT:SELECT_SOURCE";
    await user.save();
    this.handler.sendMessage(
      user.chatId,
      "👥 Select participant source:",
      this.createSourceSelectionKeyboard()
    );
  }

  async handleSourceSelection(user, text) {
    const choice = text.toLowerCase().replace(/[^a-z ]/g, "");
    if (choice.includes("group")) {
      user.currState = "SPLIT:GROUP_SELECT";
      await user.save();
      return this.showGroupSelection(user);
    }
    if (choice.includes("manual")) {
      user.currState = "SPLIT:MANUAL_PARTICIPANTS";
      await user.save();
      return this.handler.sendMessage(
        user.chatId,
        "👤 Enter participants (comma-separated emails/mobiles/IDs):\nExample: 9876543210, john@example.com, 507f1f77bcf86cd799439011",
        this.handler.getCancelKeyboard()
      );
    }
    this.handler.sendMessage(
      user.chatId,
      "⚠️ Please select a valid option:",
      this.createSourceSelectionKeyboard()
    );
  }

  async showGroupSelection(user) {
    try {
      const groups = await Group.find({ members: user._id });
      if (!groups.length) {
        this.handler.sendMessage(
          user.chatId,
          "❌ You don't have any groups yet. Create one first!",
          this.handler.getMainKeyboard()
        );
        return this.handler.resetUserState(user);
      }
      this.handler.sendMessage(
        user.chatId,
        "🏘️ Your Groups:",
        this.createGroupSelectionKeyboard(groups)
      );
    } catch (error) {
      logger.error("Group selection error:", error);
      this.handler.sendMessage(
        user.chatId,
        "❌ Error loading groups. Please try again.",
        this.handler.getMainKeyboard()
      );
    }
  }

  async handleGroupSelect(user, text) {
    try {
      const group = await Group.findOne({
        name: text,
        members: user._id,
      }).populate("members");

      if (!group) throw new Error("Group not found or access denied");

      const participants = group.members
        .filter((m) => !m._id.equals(user._id))
        .map((m) => ({
          id: m._id,
          display: m.mobile ? `📱 ${m.mobile}` : `📧 ${m.email}`,
        }));

      if (participants.length === 0) {
        throw new Error("No other members in this group");
      }

      user.inProgressData.group = {
        id: group._id,
        name: group.name,
      };
      user.inProgressData.participants = participants.map((p) => p.id);
      user.markModified("inProgressData");

      const groupInfo = [
        `🏘️ Selected Group: ${group.name}`,
        `👥 Members: ${group.members.length} total`,
        `📝 Description: ${group.description || "No description"}`,
        `💵 Amount to Split: ${user.inProgressData.amount} ${user.inProgressData.currency}`,
      ].join("\n");

      await this.handler.sendMessage(
        user.chatId,
        groupInfo,
        this.handler.getCancelKeyboard()
      );

      if (user.inProgressData.splitType === "EQUAL") {
        const shareValue =
          user.inProgressData.amount / (participants.length + 1);
        const shares = this.calculateEqualShares(
          shareValue,
          participants.length + 1,
          user.inProgressData.amount // Pass the total amount as third parameter
        );
        return this.finalizeSplit(user, shares);
      }

      user.currState = "SPLIT:SHARES";
      await user.save();

      this.handler.sendMessage(
        user.chatId,
        `📊 Enter ${user.inProgressData.splitType.toLowerCase()} shares for ${
          participants.length
        } participants:`,
        this.createSharesExampleKeyboard(participants.length)
      );
    } catch (error) {
      logger.error("Group handling error:", error);
      this.handler.sendMessage(
        user.chatId,
        `❌ Error: ${error.message}`,
        this.handler.getMainKeyboard()
      );
    }
  }

  async handleManualParticipants(user, text) {
    try {
      const entries = text.split(",").map((e) => e.trim());
      const participants = await Promise.all(
        entries.map(async (entry) => ({
          entry,
          user: await this.findUserByIdentifier(entry),
        }))
      );

      const validParticipants = participants
        .filter((p) => p.user)
        .map((p) => ({
          id: p.user._id,
          display: p.user.mobile ? `📱 ${p.user.mobile}` : `📧 ${p.user.email}`,
        }));

      const invalidEntries = participants
        .filter((p) => !p.user)
        .map((p) => p.entry);

      if (invalidEntries.length > 0) {
        await this.handler.sendMessage(
          user.chatId,
          `⚠️ Couldn't find: ${invalidEntries.join(", ")}`
        );
      }

      if (validParticipants.length === 0) {
        throw new Error("No valid participants found");
      }

      user.inProgressData.participants = validParticipants.map((p) => p.id);
      user.markModified("inProgressData");
      user.currState = "SPLIT:SHARES";
      await user.save();

      this.handler.sendMessage(
        user.chatId,
        `📊 Enter ${user.inProgressData.splitType.toLowerCase()} shares for ${
          validParticipants.length
        } participants:`,
        this.createSharesExampleKeyboard(validParticipants.length)
      );
    } catch (error) {
      logger.error("Participant handling error:", error);
      this.handler.sendMessage(
        user.chatId,
        `❌ Error: ${error.message}`,
        this.handler.getCancelKeyboard()
      );
    }
  }

  async handleShares(user, text) {
    try {
      let shares = text
        .split(",")
        .map((s) => parseFloat(s.replace(/[^0-9.]/g, "")))
        .filter((n) => !isNaN(n));

      if (user.inProgressData.splitType === "EQUAL") {
        shares = this.calculateEqualShares(
          user.inProgressData.amount /
            (user.inProgressData.participants.length + 1),
          user.inProgressData.participants.length + 1
        );
      }

      if (shares.length !== user.inProgressData.participants.length) {
        throw new Error(
          `Need exactly ${user.inProgressData.participants.length} numeric values`
        );
      }

      const total = shares.reduce((a, b) => a + b, 0);
      const validation = this.validateShares(total, user.inProgressData);

      if (!validation.valid) {
        throw new Error(validation.message);
      }

      await this.finalizeSplit(user, shares);
    } catch (error) {
      logger.error("Shares handling error:", error);
      this.handler.sendMessage(
        user.chatId,
        `❌ Error: ${error.message}`,
        this.handler.getCancelKeyboard()
      );
    }
  }

  async finalizeSplit(user, shares) {
    try {
      const participants = await User.find({
        _id: { $in: user.inProgressData.participants },
      }).select("mobile email");

      // const temp = await User.findById(user_id).select("mobile email");
      // participants = [...participants];

      const transaction = new Transaction({
        amount: user.inProgressData.amount,
        currency: user.inProgressData.currency,
        description: user.inProgressData.description,
        category: user.inProgressData.category,
        type: "expense",
        splitType: "group",
        createdBy: user._id,
        group: user.inProgressData.group?.id,
        date: new Date(),
      });

      const split = new Split({
        transaction: transaction._id,
        paidBy: user._id,
        group: user.inProgressData.group?.id,
        participants: participants.map((userDoc, index) => ({
          user: userDoc._id,
          share: shares[index],
          settled: false,
          contact: {
            mobile: userDoc.mobile,
            email: userDoc.email,
          },
        })),
        splitType: user.inProgressData.splitType,
      });

      await transaction.save();
      await split.save();

      user.transactions.push(transaction._id);
      user.splits.push(split._id);
      await user.save();

      const confirmation = this.createConfirmationMessage(
        user,
        transaction,
        split
      );
      // this.handler.sendMessage(
      //   user.chatId,
      //   confirmation,
      //   this.handler.getMainKeyboard()
      // );
      this.handler.resetUserState(user);
    } catch (error) {
      logger.error("Split finalization error:", error);
      this.handler.sendMessage(
        user.chatId,
        `❌ Error creating split: ${error.message}`,
        this.handler.getMainKeyboard()
      );
    }
  }

  // Helper Methods
  createCurrencyKeyboard() {
    return {
      keyboard: [
        this.CURRENCIES.map((c) => `${c} ${this.getCurrencySymbol(c)}`),
      ],
      resize_keyboard: true,
    };
  }

  getCurrencySymbol(currency) {
    const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
    return symbols[currency] || "";
  }

  createCategoryKeyboard() {
    const chunkSize = 2;
    const chunks = [];
    for (let i = 0; i < this.CATEGORIES.length; i += chunkSize) {
      chunks.push(this.CATEGORIES.slice(i, i + chunkSize));
    }
    return { keyboard: chunks, resize_keyboard: true };
  }

  createSplitTypeKeyboard() {
    return {
      keyboard: [
        ["EQUAL ➗", "PERCENTAGE %"],
        ["EXACT ⚖️", "Back"],
      ],
      resize_keyboard: true,
    };
  }

  calculateEqualShares(shareValue, count, totalAmount) {
    const shares = Array(count).fill(Math.round(shareValue * 100) / 100);
    const total = shares.reduce((a, b) => a + b, 0);
    const difference = Math.round((totalAmount - total) * 100) / 100;

    if (difference !== 0) {
      shares[0] += difference;
      shares[0] = Math.round(shares[0] * 100) / 100;
    }

    return shares;
  }

  validateShares(total, data) {
    const tolerance = 0.01; // Allow 0.01 difference for floating point errors
    if (data.splitType === "PERCENTAGE") {
      return Math.abs(total - 100) < tolerance
        ? { valid: true }
        : {
            valid: false,
            message: `Total must be 100% (Current: ${total.toFixed(2)}%)`,
          };
    }
    if (data.splitType === "EXACT") {
      return Math.abs(total - data.amount) < tolerance
        ? { valid: true }
        : {
            valid: false,
            message: `Sum must equal ${data.amount} ${
              data.currency
            } (Current: ${total.toFixed(2)})`,
          };
    }
    return { valid: true };
  }

  async createConfirmationMessage(user, transaction, split) {
    console.log(split, transaction);

    // Await all participant messages
    const participantLines = await Promise.all(
      split.participants.map(async (p) => {
        const person = await User.findById(p.user);
        const contact = person?.mobile
          ? `📱 ${person.mobile}`
          : `📧 ${person.email}`;
        return ` • ${contact}: ${p.share.toFixed(2)} ${transaction.currency}`;
      })
    );

    const g = await Group.findById(split.group);
    console.log(g);

    const res = [
      "🎉 Split Expense Created Successfully",
      "━".repeat(30),
      `💳 Amount: ${transaction.amount.toFixed(2)} ${transaction.currency}`,
      `📦 Category: ${transaction.category}`,
      `📝 Description: ${transaction.description}`,
      `🔀 Split Type: ${split.splitType ? split.splitType : "group"}`,
      transaction.group ? `🏘️ Group: ${g.name}` : "",
      "━".repeat(30),
      "👥 Participant Breakdown:",
      ...participantLines,
      "━".repeat(30),
      "💡 Tip: Use /reminders to track payments",
    ]
      .filter((line) => line)
      .join("\n");

    console.log(res);
    this.handler.sendMessage(user.chatId, res, this.handler.getMainKeyboard());
    return res;
  }

  createSourceSelectionKeyboard() {
    return {
      keyboard: [["🏘️ Group", "👤 Manual Entry"], ["🔙 Back"]],
      resize_keyboard: true,
    };
  }

  createGroupSelectionKeyboard(groups) {
    const groupButtons = groups.map((group) => [group.name]);
    groupButtons.push(["🔙 Back"]);
    return { keyboard: groupButtons, resize_keyboard: true };
  }

  createSharesExampleKeyboard(participantCount) {
    const example = Array(participantCount)
      .fill(
        this.SPLIT_TYPES === "PERCENTAGE"
          ? Math.floor(100 / participantCount)
          : (user.inProgressData.amount / participantCount).toFixed(2)
      )
      .join(", ");

    return {
      keyboard: [[example], ["🔙 Back"]],
      resize_keyboard: true,
    };
  }

  async findUserByIdentifier(identifier) {
    try {
      if (mongoose.Types.ObjectId.isValid(identifier)) {
        return await User.findById(identifier);
      }
      if (identifier.includes("@")) {
        return await User.findOne({ email: identifier.toLowerCase() });
      }
      if (/^\d+$/.test(identifier)) {
        return await User.findOne({ mobile: identifier });
      }
      return null;
    } catch (error) {
      logger.error("User lookup error:", error);
      return null;
    }
  }

  async handleBack(user) {
    const stateMap = {
      "SPLIT:CURRENCY": null,
      "SPLIT:AMOUNT": "SPLIT:CURRENCY",
      "SPLIT:DESCRIPTION": "SPLIT:AMOUNT",
      "SPLIT:CATEGORY": "SPLIT:DESCRIPTION",
      "SPLIT:SPLIT_TYPE": "SPLIT:CATEGORY",
      "SPLIT:SELECT_SOURCE": "SPLIT:SPLIT_TYPE",
      "SPLIT:GROUP_SELECT": "SPLIT:SELECT_SOURCE",
      "SPLIT:MANUAL_PARTICIPANTS": "SPLIT:SELECT_SOURCE",
      "SPLIT:SHARES": () =>
        user.inProgressData.group
          ? "SPLIT:GROUP_SELECT"
          : "SPLIT:MANUAL_PARTICIPANTS",
    };

    const currentState = user.currState;
    const newState =
      typeof stateMap[currentState] === "function"
        ? stateMap[currentState]()
        : stateMap[currentState];

    user.currState = newState || "";
    await user.save();

    if (newState) {
      this.handler.showCurrentMenu(user);
    } else {
      this.handler.showMainMenu(user.chatId);
    }
  }
}

module.exports = SplitController;
