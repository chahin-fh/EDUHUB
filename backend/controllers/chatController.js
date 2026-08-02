const mongoose = require("mongoose");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
// ⚠️ Restriction « payer pour contacter les moniteurs » commentée :
// const { hasPaidEnrollment } = require("../middleware/enrollment");

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
      "name username email avatar isActive role isMonitor"
    );

    if (!otherUser || !otherUser.isActive) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    // ⚠️ Restriction « avoir payé pour contacter les moniteurs » commentée :
    // Un utilisateur qui n'a pas payé pour un cours ne peut pas contacter un
    // moniteur (les admins sont exemptés)
    // if (
    //   (otherUser.isMonitor || otherUser.role === "admin") &&
    //   req.user.role !== "admin"
    // ) {
    //   const paid = await hasPaidEnrollment(req.user._id);
    //
    //   if (!paid) {
    //     const err = new Error(
    //       "Vous devez avoir payé pour un cours pour contacter les moniteurs"
    //     );
    //     err.status = 403;
    //     throw err;
    //   }
    // }

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

// Sérialise un message en ajoutant le statut de lecture pour son expéditeur :
// - "sent" : envoyé (personne d'autre ne l'a encore lu)
// - "seen" : vu (au moins un autre participant l'a lu)
function serializeMessage(message, currentUserId) {
  const obj = message.toObject ? message.toObject() : { ...message };
  const senderId =
    (obj.sender && (obj.sender._id || obj.sender))?.toString?.() || "";
  if (senderId === String(currentUserId)) {
    obj.status = (obj.readBy || []).some((r) => r.toString() !== senderId)
      ? "seen"
      : "sent";
  }
  return obj;
}

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

    const messages = messagesDesc
      .reverse()
      .map((m) => serializeMessage(m, req.user._id));

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

    return res
      .status(201)
      .json({ message: serializeMessage(populatedMessage, req.user._id) });
  } catch (error) {
    return next(error);
  }
};

// @desc    Ajouter / retirer une réaction emoji sur un message (toggle)
// @route   POST /api/chat/conversations/:id/messages/:messageId/reactions
// @access  Private
exports.toggleReaction = async (req, res, next) => {
  try {
    const conversationId = ensureObjectId(req.params.id);
    const messageId = ensureObjectId(req.params.messageId);
    const emoji = String(req.body.emoji || "").trim();

    if (!emoji) {
      const err = new Error("Emoji requis");
      err.status = 400;
      throw err;
    }

    // Limite de longueur : un emoji est court (1-4 caractères UTF-16 max)
    if (emoji.length > 8) {
      const err = new Error("Emoji invalide");
      err.status = 400;
      throw err;
    }

    // Seuls les participants de la conversation peuvent réagir
    await ensureConversationAccess(conversationId, req.user._id);

    const message = await Message.findOne({
      _id: messageId,
      conversation: conversationId,
    });
    if (!message) {
      const err = new Error("Message not found");
      err.status = 404;
      throw err;
    }

    const userId = req.user._id.toString();
    const existingIndex = message.reactions.findIndex(
      (r) => r.emoji === emoji && r.user.toString() === userId
    );

    if (existingIndex >= 0) {
      // Déjà réagi : on retire la réaction
      message.reactions.splice(existingIndex, 1);
    } else {
      message.reactions.push({ emoji, user: req.user._id });
    }

    await message.save();

    const updated = await Message.findById(message._id).populate({
      path: "sender",
      select: "name username email avatar",
    });

    return res
      .status(200)
      .json({ success: true, message: serializeMessage(updated, req.user._id) });
  } catch (error) {
    return next(error);
  }
};

// @desc    Supprimer un message (uniquement l'expéditeur, AVANT lecture)
// @route   DELETE /api/chat/conversations/:id/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res, next) => {
  try {
    const conversationId = ensureObjectId(req.params.id);
    const messageId = ensureObjectId(req.params.messageId);

    const conversation = await ensureConversationAccess(
      conversationId,
      req.user._id
    );

    const message = await Message.findOne({
      _id: messageId,
      conversation: conversationId,
    });
    if (!message) {
      const err = new Error("Message not found");
      err.status = 404;
      throw err;
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      const err = new Error(
        "Vous ne pouvez supprimer que vos propres messages"
      );
      err.status = 403;
      throw err;
    }

    // Suppression autorisée UNIQUEMENT avant que l'autre participant ait vu
    const otherIds = (conversation.participants || []).filter(
      (p) => p.toString() !== req.user._id.toString()
    );
    const seenByOther = otherIds.some((oid) =>
      (message.readBy || []).some((r) => r.toString() === oid.toString())
    );

    if (seenByOther) {
      const err = new Error(
        "Ce message a déjà été vu : suppression impossible"
      );
      err.status = 403;
      throw err;
    }

    await Message.deleteOne({ _id: messageId });

    // Si c'était le dernier message, mettre à jour l'aperçu de la conversation
    if (
      conversation.lastMessage &&
      conversation.lastMessage.toString() === messageId.toString()
    ) {
      const previous = await Message.findOne({
        conversation: conversationId,
        _id: { $ne: messageId },
      }).sort({ createdAt: -1 });
      conversation.lastMessage = previous ? previous._id : undefined;
      conversation.lastMessageAt = previous
        ? previous.createdAt
        : conversation.createdAt;
      await conversation.save();
    }

    return res.json({ success: true, message: "Message supprimé" });
  } catch (error) {
    return next(error);
  }
};
