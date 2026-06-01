
import express from "express";
import { ipLimiter } from "../middlewares/ipLimiter.js";
import {
  createChannel,
  getWorkspaceChannels,
  getChannelById,
  updateChannel,
  deleteChannel,
  archiveChannel,
  addChannelMember,
  removeChannelMember,
} from "../controllers/channel.controller.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// 🔥 Create channel (admin / subadmin)
router.post(
  "/",
  protect,
  authorizeRoles("admin", "subadmin"),
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

// ✏ Update channel (admin / subadmin)
router.put(
  "/:channelId",
  protect,
  authorizeRoles("admin", "subadmin"),
  updateChannel
);

// 🗑 Soft delete channel (admin only)
router.delete(
  "/:channelId",
  protect,
  authorizeRoles("admin"),
  deleteChannel
);

// 📦 Archive channel
router.patch(
  "/:channelId/archive",
  protect,
  authorizeRoles("admin", "subadmin"),
  archiveChannel
);

// 👥 Add member to channel
router.post(
  "/:channelId/members",
  protect,
  authorizeRoles("admin", "subadmin"),
  addChannelMember
);

// ❌ Remove member from channel
router.delete(
  "/:channelId/members/:userId",
  protect,
  authorizeRoles("admin", "subadmin"),
  removeChannelMember
);

export default router;
