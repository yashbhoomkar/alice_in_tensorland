const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const logger = require("../config/logger");

router.post("/telegram", async (req, res) => {
  try {
    await userController.handleWebhook(req.body);
    res.status(200).json({ status: "success" });
  } catch (error) {
    logger.error(`Webhook error: ${error.stack}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

// router.post("/gemini-webhook", async (req, res) => {
//   try {
//     const { chatId, message } = req.body;
//     await handleGeminiMessage(chatId, message);
//     res.status(200).json({ success: true });
//   } catch (error) {
//     logger.error("Webhook error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

module.exports = router;