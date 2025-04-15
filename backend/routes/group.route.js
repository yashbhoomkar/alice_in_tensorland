const express = require("express");
const { createGroup, getAllGroups, getGroupById, updateGroup, deleteGroup,getGroupsByUserId,getGroupMembers } = require("../controllers/group.controller");

const router = express.Router();

router.post("/", createGroup);
router.get("/", getAllGroups);
router.get("/:id", getGroupById);
router.get("/member/:groupId", getGroupMembers);
router.get("/user/:userId", getGroupsByUserId);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

module.exports = router;
