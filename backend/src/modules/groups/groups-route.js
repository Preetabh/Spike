
import express from "express";
import {
  getAllGroups

} from "./groups.controller.js";

import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// 🔥 get groups
router.get("/",  getAllGroups);

export default router;
