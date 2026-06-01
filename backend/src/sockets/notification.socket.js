/* =========================================================
   ENTERPRISE NOTIFICATION SOCKET SYSTEM (Slack-Level)
========================================================= */

// In-memory tracking (can be replaced with Redis later)
const userNotificationCount = new Map();

const notificationSocket = (io, socket) => {
  /* ==============================
     JOIN USER PERSONAL ROOM
  ============================== */
  socket.on("joinUserRoom", (userId) => {
    socket.join(`user_${userId}`);

    if (!userNotificationCount.has(userId)) {
      userNotificationCount.set(userId, 0);
    }
  });

  /* ==============================
     SEND NOTIFICATION
  ============================== */
  socket.on("send-notification", ({ userId, notification }) => {
    io.to(`user_${userId}`).emit("notification", notification);
  });

  /* ==============================
     MARK NOTIFICATION AS READ
  ============================== */
  socket.on("markNotificationRead", ({ userId }) => {
    userNotificationCount.set(userId, 0);

    io.to(`user_${userId}`).emit("notificationCountUpdate", {
      unreadCount: 0,
    });
  });

  /* ==============================
     CLEAR ALL NOTIFICATIONS
  ============================== */
  socket.on("clearNotifications", ({ userId }) => {
    userNotificationCount.set(userId, 0);

    io.to(`user_${userId}`).emit("notificationsCleared");

    io.to(`user_${userId}`).emit("notificationCountUpdate", {
      unreadCount: 0,
    });
  });

  /* ==============================
     DISCONNECT HANDLING
  ============================== */
  socket.on("disconnect", () => {
    // Optional: cleanup logic if needed
  });
};

export default notificationSocket;
