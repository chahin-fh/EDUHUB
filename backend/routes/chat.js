const express = require("express");

const router = express.Router();
const protect = require("../middleware/authMiddleware");
const requireEmailVerification = require("../middleware/emailVerification");
const chatController = require("../controllers/chatController");
const { uploadChatFile } = require("../config/multer");

router.post(
  "/upload",
  protect,
  requireEmailVerification,
  uploadChatFile.single("file"),
  chatController.uploadChatAttachment
);
router.get("/users/search", protect, chatController.searchUsers);
router.get("/users", protect, chatController.listUsers);
router.get("/conversations", protect, chatController.getConversations);
router.post(
  "/conversations",
  protect,
  requireEmailVerification,
  chatController.getOrCreateDirectConversation
);
router.get("/conversations/:id/messages", protect, chatController.getMessages);
router.post(
  "/conversations/:id/messages",
  protect,
  requireEmailVerification,
  chatController.sendMessage
);
router.post(
  "/conversations/:id/messages/:messageId/reactions",
  protect,
  requireEmailVerification,
  chatController.toggleReaction
);
router.delete(
  "/conversations/:id/messages/:messageId",
  protect,
  requireEmailVerification,
  chatController.deleteMessage
);

module.exports = router;
