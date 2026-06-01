import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    // 🔥 Workspace (null for DM calls)
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
      index: true,
    },

    // 🔥 Channel (for channel calls)
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      default: null,
      index: true,
    },

    // 🔥 Caller (who started call)
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔥 Participants
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],

    // 🔥 Call Type
    callType: {
      type: String,
      enum: ["audio", "video"],
      required: true,
      index: true,
    },

    // 🔥 Call Status
    status: {
      type: String,
      enum: ["ringing", "accepted", "rejected", "missed", "ended"],
      default: "ringing",
      index: true,
    },

    // 🔥 Signaling Room ID (for WebRTC / Socket)
    roomId: {
      type: String,
      required: true,
      unique: true,
    },

    // 🔥 Recording URL (future support)
    recordingUrl: {
      type: String,
      default: null,
    },

    // 🔥 Time tracking
    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    duration: {
      type: Number,
      default: 0,
    },

    // 🔥 Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// 🔥 Auto-calculate duration before save if ended
callSchema.pre("save", function (next) {
  if (this.startedAt && this.endedAt) {
    this.duration = Math.floor(
      (this.endedAt.getTime() - this.startedAt.getTime()) / 1000
    );
  }
  next();
});

export default mongoose.model("Call", callSchema);
