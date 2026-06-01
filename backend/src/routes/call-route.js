import express from "express";
import {
  startCall,
  acceptCall,
  rejectCall,
  endCall,
  saveCall,
  getCallHistory,
  getWorkspaceCalls,
  getCallById,
  deleteCall,
} from "../controllers/call.controller.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/* =====================================
   START CALL (Audio / Video)
===================================== */
router.post("/start", protect, startCall);

/* =====================================
   ACCEPT CALL
===================================== */
router.patch("/:callId/accept", protect, acceptCall);

/* =====================================
   REJECT CALL
===================================== */
router.patch("/:callId/reject", protect, rejectCall);

/* =====================================
   END CALL
===================================== */
router.patch("/:callId/end", protect, endCall);

/* =====================================
   SAVE CALL HISTORY (fallback/manual)
===================================== */
router.post("/", protect, saveCall);

/* =====================================
   GET USER CALL HISTORY
===================================== */
router.get("/me", protect, getCallHistory);

/* =====================================
   GET SINGLE CALL
===================================== */
router.get("/:callId", protect, getCallById);

/* =====================================
   GET WORKSPACE CALLS (Admin Only)
===================================== */
router.get(
  "/workspace/:workspaceId",
  protect,
  authorizeRoles("admin"),
  getWorkspaceCalls
);

/* =====================================
   DELETE CALL (Soft Delete - Admin)
===================================== */
router.delete(
  "/:callId",
  protect,
  authorizeRoles("admin"),
  deleteCall
);

export default router;
