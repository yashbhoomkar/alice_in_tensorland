const mongoose = require("mongoose");
const Group = require("../models/group.model");
const User = require("../models/user.model");
const logger = require("../config/logger");

class GroupController {
  constructor(handler) {
    this.handler = handler;
  }

  async startCreateGroup(user) {
    user.currState = "GROUP:CREATE_NAME";
    await user.save();
    this.handler.sendMessage(
      user.chatId,
      "🆕 Enter group name:",
      this.handler.getCancelKeyboard()
    );
  }

  async handleInput(user, text) {
    const [, step] = user.currState.split(":");
    const handlers = {
      CREATE_NAME: () => this.handleGroupName(user, text),
      CREATE_DESCRIPTION: () => this.handleGroupDescription(user, text),
      CREATE_MEMBERS: () => this.handleGroupMembers(user, text),
    };
    return handlers[step]?.();
  }

  async handleGroupName(user, text) {
    user.inProgressData = { name: text };
    user.currState = "GROUP:CREATE_DESCRIPTION";
    await user.save();
    this.handler.sendMessage(
      user.chatId,
      "📝 Enter group description:",
      this.handler.getCancelKeyboard()
    );
  }

  async handleGroupDescription(user, text) {
    user.inProgressData.description = text;
    user.currState = "GROUP:CREATE_MEMBERS";
    await user.save();
    this.handler.sendMessage(
      user.chatId,
      "👥 Add members (comma-separated emails/mobiles/IDs):",
      this.handler.getCancelKeyboard()
    );
  }

  async handleGroupMembers(user, text) {
    try {
      const entries = text.split(",").map((m) => m.trim());

      const memberData = await Promise.all(
        entries.map(async (entry) => ({
          entry,
          user: await this.findUserByIdentifier(entry),
        }))
      );

      const validMembers = memberData
        .filter(({ user }) => user)
        .map(({ user }) => user._id);

      const invalidEntries = memberData
        .filter(({ user }) => !user)
        .map(({ entry }) => entry);

      const uniqueMembers = [
        ...new Set([
          user._id.toString(),
          ...validMembers.map((id) => id.toString()),
        ]),
      ].map((id) => new mongoose.Types.ObjectId(id));

      console.log("debug - 01", invalidEntries, uniqueMembers);
      if (invalidEntries.length > 0) {
        this.handler.sendMessage(
          user.chatId,
          `⚠️ Invalid entries: ${invalidEntries.join(", ")}`,
          this.handler.getMainKeyboard()
        );
      }

      const group = new Group({
        ...user.inProgressData,
        members: uniqueMembers,
        createdBy: user._id,
      });

      await group.save();
      user.groups.push(group._id);
      await user.save();

      this.handler.sendMessage(
        user.chatId,
        `✅ Group "${group.name}" created!`,
        this.handler.getMainKeyboard()
      );
      this.handler.resetUserState(user);
    } catch (error) {
      logger.error("Group creation failed:", error);
      this.handler.sendMessage(
        user.chatId,
        `❌ Error creating group: ${error.message}`,
        this.handler.getMainKeyboard()
      );
    }
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
    const [, step] = user.currState.split(":");
    const backSteps = {
      CREATE_NAME: null,
      CREATE_DESCRIPTION: "GROUP:CREATE_NAME",
      CREATE_MEMBERS: "GROUP:CREATE_DESCRIPTION",
    };
    user.currState = backSteps[step] || "";
    await user.save();
    this.handler.showCurrentMenu(user);
  }
}

module.exports = GroupController;
