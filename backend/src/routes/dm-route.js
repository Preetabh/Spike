import express from "express";
import { ipLimiter } from "../middlewares/ipLimiter.js";

import {
  createOrGetDM,
  getUserDMs,
  getDMById,
  deleteDM,
} from "../controllers/dm.controller.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔥 Create or get existing DM (1-to-1)
router.post("/", protect, createOrGetDM);

// 📩 Get all DMs of logged-in user
router.get("/", protect,ipLimiter, getUserDMs);

// 📄 Get single DM details
router.get("/:dmId", protect, getDMById);

// 🗑 Delete / Leave DM
router.delete("/:dmId", protect, deleteDM);

export default router;
