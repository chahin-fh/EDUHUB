const express = require("express");

const router = express.Router();
const protect = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");

router.get("/users/search", protect, chatController.searchUsers);
router.get("/users", protect, chatController.listUsers);
router.get("/conversations", protect, chatController.getConversations);
router.post(
  "/conversations",
  protect,
  chatController.getOrCreateDirectConversation
);
router.get("/conversations/:id/messages", protect, chatController.getMessages);
router.post(
  "/conversations/:id/messages",
  protect,
  chatController.sendMessage
);

module.exports = router;
