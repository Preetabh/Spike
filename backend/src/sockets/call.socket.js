import prisma from "../db/db.js";
import { sendPushNotification } from "../lib/push.js";

/* =========================================================
   ENTERPRISE CALL SOCKET SYSTEM (Slack-Level)
 ========================================================= */

const activeCalls = new Map();

const callSocket = (io, socket) => {
  /* ==============================
     USER ONLINE PRESENCE
  ============================== */
  socket.on("joinUserRoom", (userId) => {
    socket.join(`user_${userId}`);
  });

  /* ==============================
     START CALL (1-1 / GROUP)
  ============================== */
  socket.on("callUser", (data) => {
    const { callId, participants, callType, callScope } = data;

    activeCalls.set(callId, {
      participants,
      status: "ringing",
      startedAt: Date.now(),
      conversationId: data.chatId,
      callType: callType,
      callerId: socket.data?.user?.id,
    });

    participants.forEach(async (userId) => {
      // 1. Emit live socket alert
      io.to(`user_${userId}`).emit("incomingCall", data);

      // 2. Dispatch Firebase FCM Push Alert
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { fcmToken: true },
        });

        if (user?.fcmToken) {
          const typeLabel = callType === "video" ? "Video Call" : "Voice Call";
          const title = `Incoming ${typeLabel}`;
          const body = `${data.callerName || "Someone"} is calling you...`;

          await sendPushNotification(user.fcmToken, title, body, {
            callId,
            callType,
            chatId: data.chatId,
            callerName: data.callerName || "Someone",
            click_action: "FLUTTER_NOTIFICATION_CLICK",
          });
        }
      } catch (err) {
        console.error("[FCM] Socket call notification error:", err.message);
      }
    });
  });

  /* ==============================
     ACCEPT CALL
  ============================== */
  socket.on("answerCall", (data) => {
    const { callId, userId } = data;

    if (activeCalls.has(callId)) {
      activeCalls.get(callId).status = "accepted";
      activeCalls.get(callId).startedAt = Date.now(); // Reset start time to accept time for duration tracking
    }

    io.emit("callAccepted", data);
  });

  /* ==============================
     REJECT CALL
  ============================== */
  socket.on("rejectCall", async (data) => {
    const { callId } = data;

    if (activeCalls.has(callId)) {
      const call = activeCalls.get(callId);
      const text = `Declined ${call.callType === "video" ? "Video Call" : "Voice Call"}`;
      
      try {
        const newMessage = await prisma.message.create({
          data: {
            conversationId: call.conversationId,
            senderId: socket.data?.user?.id || call.callerId,
            content: text,
            messageType: "system",
          },
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
                email: true,
              }
            }
          }
        });
        io.to(`conversation_${call.conversationId}`).emit("receive-message", newMessage);
      } catch (err) {
        console.error("Failed to save declined call message:", err);
      }

      activeCalls.delete(callId);
    }

    io.emit("callRejected", data);
  });

  /* ==============================
     END CALL
  ============================== */
  socket.on("endCall", async (data) => {
    const { callId } = data;

    if (activeCalls.has(callId)) {
      const call = activeCalls.get(callId);
      const durationSecs = Math.round((Date.now() - call.startedAt) / 1000);
      const isAccepted = call.status === "accepted";
      
      let text = "";
      if (isAccepted) {
        const mins = Math.floor(durationSecs / 60);
        const secs = durationSecs % 60;
        const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        text = `${call.callType === "video" ? "Video Call" : "Voice Call"} Ended • ${durationStr}`;
      } else {
        text = `Missed ${call.callType === "video" ? "Video Call" : "Voice Call"}`;
      }

      try {
        const newMessage = await prisma.message.create({
          data: {
            conversationId: call.conversationId,
            senderId: call.callerId,
            content: text,
            messageType: "system",
          },
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
                email: true,
              }
            }
          }
        });
        io.to(`conversation_${call.conversationId}`).emit("receive-message", newMessage);
      } catch (err) {
        console.error("Failed to save call history message:", err);
      }

      activeCalls.delete(callId);
    }

    io.emit("callEnded", data);
  });

  /* ==============================
     JOIN CALL ROOM (WebRTC Signaling)
  ============================== */
  socket.on("joinCallRoom", ({ callId }) => {
    socket.join(`call_${callId}`);
  });

  socket.on("webrtcSignal", ({ callId, signal }) => {
    socket.to(`call_${callId}`).emit("webrtcSignal", {
      callId,
      signal,
      from: socket.data?.user?.id,
    });
  });

  /* ==============================
     TYPING INDICATOR DURING CALL CHAT
  ============================== */
  socket.on("typingInCall", ({ callId, userId }) => {
    socket.to(`call_${callId}`).emit("userTypingInCall", { userId });
  });

  socket.on("stopTypingInCall", ({ callId, userId }) => {
    socket.to(`call_${callId}`).emit("userStoppedTypingInCall", { userId });
  });

  /* ==============================
     CALL TIMEOUT CHECK (Auto Missed)
  ============================== */
  setInterval(() => {
    const now = Date.now();
    activeCalls.forEach(async (call, callId) => {
      const diff = now - call.startedAt;
      if (call.status === "ringing" && diff > 30000) {
        const text = `Missed ${call.callType === "video" ? "Video Call" : "Voice Call"}`;
        try {
          const newMessage = await prisma.message.create({
            data: {
              conversationId: call.conversationId,
              senderId: call.callerId,
              content: text,
              messageType: "system",
            },
            include: {
              sender: {
                select: {
                  id: true,
                  fullName: true,
                  avatar: true,
                  email: true,
                }
              }
            }
          });
          io.to(`conversation_${call.conversationId}`).emit("receive-message", newMessage);
        } catch (err) {
          console.error("Failed to save missed call message:", err);
        }
        io.emit("callMissed", { callId });
        activeCalls.delete(callId);
      }
    });
  }, 5000);
};

export default callSocket;
