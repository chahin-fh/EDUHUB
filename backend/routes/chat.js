const express = require("express");

const router = express.Router();
const protect = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");
const { uploadChatFile } = require("../config/multer");

router.post(
  "/upload",
  protect,
  uploadChatFile.single("file"),
  chatController.uploadChatAttachment
);
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
router.post(
  "/conversations/:id/messages/:messageId/reactions",
  protect,
  chatController.toggleReaction
);
router.delete(
  "/conversations/:id/messages/:messageId",
  protect,
  chatController.deleteMessage
);

module.exports = router;
