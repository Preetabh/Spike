import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      maxlength: 500,
    },

    // 🔥 Channel Type
    type: {
      type: String,
      enum: ["public", "private", "dm"],
      default: "public",
      index: true,
    },

    // 🔥 Workspace (null for DM)
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
      index: true,
    },

    // 🔥 Members
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],

    // 🔥 Creator
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔥 Last message (for sidebar preview)
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // 🔥 Channel topic (Slack-style header)
    topic: {
      type: String,
      default: "",
      maxlength: 250,
    },

    // 🔒 Archived support
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },

    // 🗑 Soft delete support
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// 🔥 Ensure unique channel name per workspace (excluding DM)
channelSchema.index(
  { name: 1, workspace: 1 },
  { unique: true, partialFilterExpression: { type: { $ne: "dm" } } }
);

export default mongoose.model("Channel", channelSchema);
