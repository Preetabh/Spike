import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // 🔔 Receiver of notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔥 Who triggered it
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 🔥 Notification type
    type: {
      type: String,
      enum: [
        "message",
        "mention",
        "reaction",
        "invite",
        "call",
        "workspace_invite",
        "channel_invite"
      ],
      required: true,
    },

    // 🔗 Related entities
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },

    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      default: null,
    },

    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // 🔥 Notification content (optional preview)
    contentPreview: {
      type: String,
      default: "",
    },

    // 🔥 Read / Seen tracking
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    // 🔥 Soft delete support
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
