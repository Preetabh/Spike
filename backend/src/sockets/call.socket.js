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
    });

    participants.forEach((userId) => {
      io.to(`user_${userId}`).emit("incomingCall", data);
    });
  });

  /* ==============================
     ACCEPT CALL
  ============================== */
  socket.on("answerCall", (data) => {
    const { callId, userId } = data;

    if (activeCalls.has(callId)) {
      activeCalls.get(callId).status = "accepted";
    }

    io.emit("callAccepted", data);
  });

  /* ==============================
     REJECT CALL
  ============================== */
  socket.on("rejectCall", (data) => {
    const { callId } = data;

    if (activeCalls.has(callId)) {
      activeCalls.get(callId).status = "rejected";
      activeCalls.delete(callId);
    }

    io.emit("callRejected", data);
  });

  /* ==============================
     END CALL
  ============================== */
  socket.on("endCall", (data) => {
    const { callId } = data;

    if (activeCalls.has(callId)) {
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

  socket.on("webrtcSignal", ({ callId, signal, to }) => {
    io.to(`user_${to}`).emit("webrtcSignal", {
      callId,
      signal,
      from: socket.id,
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
    activeCalls.forEach((callData, callId) => {
      const now = Date.now();
      const diff = now - callData.startedAt;

      if (callData.status === "ringing" && diff > 30000) {
        io.emit("callMissed", { callId });
        activeCalls.delete(callId);
      }
    });
  }, 10000);

  /* ==============================
     DISCONNECT HANDLER
  ============================== */
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
};

export default callSocket;
