const mongoose = require("mongoose");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

function ensureObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid id");
    err.status = 400;
    throw err;
  }

  return new mongoose.Types.ObjectId(id);
}

async function ensureConversationAccess(conversationId, userId) {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const err = new Error("Conversation not found");
    err.status = 404;
    throw err;
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === userId.toString()
  );

  if (!isParticipant) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  return conversation;
}

exports.searchUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || "").toString().trim();
    const limit = Math.min(parseInt(req.query.limit || "10", 10) || 10, 20);

    if (!q) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      isActive: true,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("name username email avatar")
      .limit(limit);

    return res.json({ users });
  } catch (error) {
    return next(error);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || "").toString().trim();
    const page = Math.max(parseInt(req.query.page || "1", 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit || "20", 10) || 20, 50);
    const skip = (page - 1) * limit;

    const query = {
      _id: { $ne: req.user._id },
      isActive: true,
    };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("name username email avatar")
        .sort({ username: 1, name: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + users.length < total,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate({
        path: "participants",
        select: "name username email avatar",
      })
      .populate({
        path: "lastMessage",
        select: "text sender createdAt readBy",
        populate: { path: "sender", select: "name username email avatar" },
      })
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    return res.json({ conversations });
  } catch (error) {
    return next(error);
  }
};

exports.getOrCreateDirectConversation = async (req, res, next) => {
  try {
    const otherUserId = ensureObjectId(req.body.userId);

    if (otherUserId.toString() === req.user._id.toString()) {
      const err = new Error("Cannot create conversation with yourself");
      err.status = 400;
      throw err;
    }

    const otherUser = await User.findById(otherUserId).select(
      "name username email avatar isActive"
    );

    if (!otherUser || !otherUser.isActive) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    let conversation = await Conversation.findOne({
      type: "direct",
      participants: { $all: [req.user._id, otherUserId] },
      $expr: { $eq: [{ $size: "$participants" }, 2] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [req.user._id, otherUserId],
        lastMessageAt: new Date(),
      });
    }

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate({
        path: "participants",
        select: "name username email avatar",
      })
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name username email avatar" },
      });

    return res.status(201).json({ conversation: populatedConversation });
  } catch (error) {
    return next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const conversationId = ensureObjectId(req.params.id);
    await ensureConversationAccess(conversationId, req.user._id);

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      {
        $addToSet: { readBy: req.user._id },
      }
    );

    const limit = Math.min(parseInt(req.query.limit || "50", 10) || 50, 100);
    const before = req.query.before ? new Date(req.query.before) : null;

    const query = {
      conversation: conversationId,
    };

    if (before && !Number.isNaN(before.getTime())) {
      query.createdAt = { $lt: before };
    }

    const messagesDesc = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: "sender",
        select: "name username email avatar",
      });

    const messages = messagesDesc.reverse();

    return res.json({ messages });
  } catch (error) {
    return next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const conversationId = ensureObjectId(req.params.id);
    const conversation = await ensureConversationAccess(
      conversationId,
      req.user._id
    );

    const text = (req.body.text || "").toString().trim();
    if (!text) {
      const err = new Error("Message text is required");
      err.status = 400;
      throw err;
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text,
      readBy: [req.user._id],
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate({
      path: "sender",
      select: "name username email avatar",
    });

    return res.status(201).json({ message: populatedMessage });
  } catch (error) {
    return next(error);
  }
};
