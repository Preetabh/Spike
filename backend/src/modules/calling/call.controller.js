import { prisma } from "../../lib/prisma.js";

/* ======================================================
   START CALL (Creates call record with ongoing status)
====================================================== */
export const startCall = async (req, res, next) => {
  try {
    const { workspaceId, participants, type } = req.body;
    const callerId = req.user.id;

    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" });
    }

    const call = await prisma.call.create({
      data: {
        workspaceId,
        callerId,
        type: type || "audio",
        status: "ongoing",
        startedAt: new Date(),
        participants: {
          connect: (participants || []).map((id) => ({ id })),
        },
      },
      include: {
        caller: {
          select: { id: true, fullName: true, avatar: true },
        },
        participants: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
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

    const call = await prisma.call.update({
      where: { id: callId },
      data: {
        status: "accepted",
      },
    });

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

    const call = await prisma.call.update({
      where: { id: callId },
      data: {
        status: "rejected",
        endedAt: new Date(),
      },
    });

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

    const call = await prisma.call.update({
      where: { id: callId },
      data: {
        status: "completed",
        duration: duration || 0,
        endedAt: new Date(),
      },
    });

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
    const { workspaceId, participants, type, duration } = req.body;
    const callerId = req.user.id;

    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" });
    }

    const call = await prisma.call.create({
      data: {
        workspaceId,
        callerId,
        type: type || "audio",
        status: "completed",
        duration: duration || 0,
        startedAt: new Date(),
        endedAt: new Date(),
        participants: {
          connect: (participants || []).map((id) => ({ id })),
        },
      },
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

    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: {
        caller: {
          select: { id: true, fullName: true, avatar: true },
        },
        participants: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
    });

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

    const call = await prisma.call.update({
      where: { id: callId },
      data: {
        status: "missed",
        endedAt: new Date(),
      },
    });

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
    const userId = req.user.id;
    const calls = await prisma.call.findMany({
      where: {
        OR: [
          { callerId: userId },
          { participants: { some: { id: userId } } },
        ],
      },
      include: {
        caller: {
          select: { id: true, fullName: true, avatar: true },
        },
        participants: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

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

    const calls = await prisma.call.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

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

    await prisma.call.delete({
      where: { id: callId },
    });

    res.json({ success: true, message: "Call deleted" });
  } catch (error) {
    next(error);
  }
};
