/* =========================================================
   ENTERPRISE PRESENCE SOCKET SYSTEM (Slack-Level)
========================================================= */

// userId -> Set of socketIds (multi-device support)
const onlineUsers = new Map();

// userId -> lastSeen timestamp
const lastSeenMap = new Map();

const presenceSocket = (io, socket) => {
  const userId = socket.data.user.id;
  socket.join(`user_${userId}`);

  io.emit("online-users", {
    userId,
    online: true,
  });

  /* ==============================
     USER ONLINE
  ============================== */
  socket.on("userOnline", (userId) => {
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    lastSeenMap.delete(userId);

    io.emit("presenceUpdate", {
      userId,
      status: "online",
    });

    io.emit("onlineUsersList", Array.from(onlineUsers.keys()));
  });

  /* ==============================
     USER HEARTBEAT (Keep Alive)
  ============================== */
  socket.on("heartbeat", (userId) => {
    if (onlineUsers.has(userId)) {
      // Just keeping connection alive
    }
  });

  /* ==============================
     GET LAST SEEN
  ============================== */
  socket.on("getLastSeen", (userId) => {
    const lastSeen = lastSeenMap.get(userId) || null;

    socket.emit("lastSeenResponse", {
      userId,
      lastSeen,
    });
  });

  /* ==============================
     DISCONNECT HANDLING
  ============================== */
  socket.on("disconnect", () => {
    onlineUsers.forEach((socketSet, userId) => {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);

        if (socketSet.size === 0) {
          onlineUsers.delete(userId);
          const now = new Date();
          lastSeenMap.set(userId, now);

          io.emit("presenceUpdate", {
            userId,
            status: "offline",
            lastSeen: now,
          });
        }
      }
    });

    io.emit("online-users", {
      userId,
      online: false,
    });

    io.emit("onlineUsersList", Array.from(onlineUsers.keys()));
  });
};

export default presenceSocket;
