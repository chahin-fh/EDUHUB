const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      trim: true,
      default: '',
    },
    // Pièces jointes envoyées avec le message (fichiers uploadés via /api/chat/upload)
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, default: 'application/octet-stream' },
        size: { type: Number, default: 0 },
      },
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Réactions par emoji : un utilisateur ne peut réagir qu'une seule fois
    // avec le même emoji (le toggle ajoute puis retire).
    reactions: [
      {
        emoji: { type: String, required: true },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
