const mongoose = require("mongoose");

const matchRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Once accepted, link to the conversation created
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
  },
  {
    timestamps: true,
  }
);

matchRequestSchema.index({ requester: 1, status: 1 });
matchRequestSchema.index({ mentor: 1, status: 1 });

const MatchRequest = mongoose.model("MatchRequest", matchRequestSchema);

module.exports = MatchRequest;
