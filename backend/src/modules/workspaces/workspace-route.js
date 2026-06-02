import express from "express";
import {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  inviteWorkspaceMember,
  removeWorkspaceMember,
  getWorkspaceByToken,
  acceptWorkspaceInvite
} from "./workspace.controller.js";

import { protect } from "../../middlewares/authMiddleware.js";
import { authorizeRoles } from "../../middlewares/roleMiddleware.js";
import { get } from "http";

const router = express.Router();

// 🔥 Create Workspace
router.post("/", protect, createWorkspace);

// 🔥 Get all workspaces of logged-in user
router.get("/", protect, getUserWorkspaces);

// 🔥 Get single workspace
router.get("/:workspaceId", protect, getWorkspaceById);

// 🔥 Edit single workspace
router.patch("/:workspaceId", protect, updateWorkspace);

// 🔥 Update workspace (only admin/subadmin)
router.put("/:workspaceId",protect,authorizeRoles("admin", "subadmin"),updateWorkspace);

// 🔥 Delete workspace (only admin)
router.delete("/:workspaceId",protect,authorizeRoles("admin"),deleteWorkspace);

// 🔥 inviteWorkspaceMember(admin/subadmin)
router.post("/:workspaceId/members",protect,inviteWorkspaceMember);

// 🔥 Remove member from workspace (admin only)
router.delete("/:workspaceId/members/:userId",protect,removeWorkspaceMember);

// 🔥 Get workspace by invite token
router.get("/invite/:token", getWorkspaceByToken);

// 🔥 Accept workspace invitation

router.post("/invite/:token/accept",acceptWorkspaceInvite);

export default router;
