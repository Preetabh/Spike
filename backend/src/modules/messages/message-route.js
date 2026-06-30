import express from "express";

import {
  sendMessage,
  getConversationMessages,
  getMessageById,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
} from "./message.controller.js";

import { protect } from "../../middlewares/authMiddleware.js";
import { ipLimiter } from "../../middlewares/ipLimiter.js";

const router = express.Router();

/*

| Message Routes

*/

// Single Message
router.get("/:messageId", protect, ipLimiter, getMessageById);

// Send Message
router.post("/", protect, sendMessage);

// Get Messages of Conversation
router.get("/conversation/:conversationId", protect, getConversationMessages);

// Edit Message
router.put("/:messageId", protect, editMessage);

// Delete Message
router.delete("/:messageId", protect, deleteMessage);

// Add Reaction
router.post("/:messageId/reactions", protect, addReaction);

// Remove Reaction
router.delete("/:messageId/reactions", protect, removeReaction);

export default router;
