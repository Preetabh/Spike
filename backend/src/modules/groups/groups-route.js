import express from "express";
import {
  getWorkspaceGroups,
  getGroupById,
  createGroup,
} from "./groups.controller.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createGroup);
router.get("/", protect, getWorkspaceGroups);
router.get("/:groupId", protect, getGroupById);

export default router;
