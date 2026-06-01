
import express from "express";
import {
  sendMessage,
  getChannelMessages,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
} from "../controllers/message.controller.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔥 Send message (channel or DM)
router.post("/", protect, sendMessage);

// 🔥 Get all messages of a channel
router.get("/channel/:channelId", protect, getChannelMessages);

// ✏ Edit message
router.put("/:messageId", protect, editMessage);

// 🗑 Delete message (soft delete)
router.delete("/:messageId", protect, deleteMessage);

// 😀 Add reaction
router.post("/:messageId/reaction", protect, addReaction);

// ❌ Remove reaction
router.delete("/:messageId/reaction", protect, removeReaction);

export default router;
