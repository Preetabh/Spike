import CallHistory from "../models/call-model.js";
import User from "../models/user-model.js";

/* ======================================================
   START CALL (Creates call record with ongoing status)
====================================================== */
export const startCall = async (req, res, next) => {
  try {
    const { chatId, participants, callType, callScope = "1-to-1", groupName } = req.body;

    if (!chatId || !participants || participants.length === 0) {
      return res.status(400).json({ message: "chatId and participants required" });
    }

    const call = await CallHistory.create({
      chatId,
      caller: req.user._id,
      participants,
      callType,
      callScope,
      groupName: callScope === "group" ? groupName : null,
      status: "ongoing",
      startedAt: new Date(),
    });

    res.status(201).json({ success: true, call });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   ACCEPT CALL
====================================================== */
export const acceptCall = async (req, res, next) => {
  try {
    const { callId } = req.params;

    const call = await CallHistory.findById(callId);
    if (!call) return res.status(404).json({ message: "Call not found" });

    call.status = "accepted";
    call.acceptedAt = new Date();
    await call.save();

    res.json({ success: true, call });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   REJECT CALL
====================================================== */
export const rejectCall = async (req, res, next) => {
  try {
    const { callId } = req.params;

    const call = await CallHistory.findById(callId);
    if (!call) return res.status(404).json({ message: "Call not found" });

    call.status = "rejected";
    call.endedAt = new Date();
    await call.save();

    res.json({ success: true, call });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   END CALL (Update duration + completed status)
====================================================== */
export const endCall = async (req, res, next) => {
  try {
    const { callId } = req.params;
    const { duration } = req.body;

    const call = await CallHistory.findById(callId);
    if (!call) return res.status(404).json({ message: "Call not found" });

    call.status = "completed";
    call.duration = duration || 0;
    call.endedAt = new Date();

    await call.save();

    res.json({ success: true, call });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   SAVE CALL (Manual History Entry)
====================================================== */
export const saveCall = async (req, res, next) => {
  try {
    const { chatId, participants, callType, duration } = req.body;

    const call = await CallHistory.create({
      chatId,
      caller: req.user._id,
      participants,
      callType,
      duration,
      status: "completed",
      startedAt: new Date(),
      endedAt: new Date(),
    });

    res.status(201).json({ success: true, call });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   GET SINGLE CALL
====================================================== */
export const getCallById = async (req, res, next) => {
  try {
    const { callId } = req.params;

    const call = await CallHistory.findById(callId)
      .populate("caller", "fullName profilePic")
      .populate("participants", "fullName profilePic");

    if (!call) return res.status(404).json({ message: "Call not found" });

    res.json({ success: true, call });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   MARK MISSED CALL
====================================================== */
export const markMissedCall = async (req, res, next) => {
  try {
    const { callId } = req.body;

    const call = await CallHistory.findById(callId);
    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    call.status = "missed";
    await call.save();

    res.json({ success: true, call });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   GET USER CALL HISTORY
====================================================== */
export const getCallHistory = async (req, res, next) => {
  try {
    const calls = await CallHistory.find({
      participants: req.user._id,
    })
      .populate("caller", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: calls.length,
      calls,
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   GET WORKSPACE CALLS (ADMIN ANALYTICS)
====================================================== */
export const getWorkspaceCalls = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const calls = await CallHistory.find({
      chatId: workspaceId,
    }).sort({ createdAt: -1 });

    const totalCalls = calls.length;
    const completed = calls.filter((c) => c.status === "completed").length;
    const missed = calls.filter((c) => c.status === "missed").length;

    res.json({
      success: true,
      analytics: {
        totalCalls,
        completed,
        missed,
      },
      calls,
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   DELETE CALL (Soft Delete - Admin)
====================================================== */
export const deleteCall = async (req, res, next) => {
  try {
    const { callId } = req.params;

    const call = await CallHistory.findById(callId);
    if (!call) return res.status(404).json({ message: "Call not found" });

    call.isDeleted = true;
    await call.save();

    res.json({ success: true, message: "Call deleted" });
  } catch (error) {
    next(error);
  }
};
