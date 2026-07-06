
import express from "express";
import { ipLimiter } from "../../middlewares/ipLimiter.js";
import {
  createChannel,
  getWorkspaceChannels,
  getChannelById,
  updateChannel,
  deleteChannel,
  archiveChannel,
  addChannelMember,
  removeChannelMember,
} from "./channel.controller.js";

import { protect } from "../../middlewares/authMiddleware.js";
import { authorizeRoles } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// 🔥 Create channel
router.post(
  "/",
  protect,
  createChannel
);

// 📂 Get all channels of workspace
router.get(
  "",
  protect,
  ipLimiter,
  getWorkspaceChannels
);

// 📄 Get single channel
router.get("/:channelId", protect, getChannelById);

// ✏ Update channel
router.put(
  "/:channelId",
  protect,
  updateChannel
);

// 🗑 Soft delete channel
router.delete(
  "/:channelId",
  protect,
  deleteChannel
);

// 📦 Archive channel
router.patch(
  "/:channelId/archive",
  protect,
  archiveChannel
);

// 👥 Add member to channel
router.post(
  "/:channelId/members",
  protect,
  addChannelMember
);

// ❌ Remove member from channel
router.delete(
  "/:channelId/members/:userId",
  protect,
  removeChannelMember
);

export default router;
