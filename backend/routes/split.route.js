const express = require("express");
const router = express.Router();
const splitController = require("../controllers/split.controller");

router.post("/create", splitController.createSplit);
router.post("/create-split-group", splitController.createGroupExpenseWithSplit);
router.get("/user/:userId", splitController.getUserGroupSplits);
router.post("/getspiltdata", splitController.getUserBalance);
router.get("/getsplitbyid/:id", splitController.getUserSplits);
router.post("/webhook", express.raw({ type: "application/json" }), splitController.handleWebhook);

module.exports = router;
