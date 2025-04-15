const UserHandler = require("../handlers/user.handler");

class UserController {
  constructor() {
    this.handler = new UserHandler(process.env.TELEGRAM_TOKEN);
  }

  async handleWebhook(update) {
    const message = update.message;
    
    if (!message) return;

    await this.handler.handleMessage(message);
  }
}

module.exports = new UserController();