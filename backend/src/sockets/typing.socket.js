/* =========================================================
   ENTERPRISE TYPING SOCKET SYSTEM (Slack-Level)
========================================================= */

// channelId -> Set of userIds currently typing
const typingUsers = new Map();

const typingSocket = (io, socket) => {
  /* ==============================
     USER START TYPING
  ============================== */
  socket.on("typing-start", ({ roomId, roomType }) => {
    const room =
      roomType === "dm"
        ? `dm_${roomId}`
        : roomType === "group"
        ? `group_${roomId}`
        : `channel_${roomId}`;

    socket.to(room).emit("user-typing", {
      roomId,
      roomType,
      user: {
        id: socket.data.user.id,
        fullName: socket.data.user.fullName,
      },
    });
  });

  /* ==============================
     USER STOP TYPING
  ============================== */
  socket.on("typing-stop", ({ roomId, roomType }) => {
    const room =
      roomType === "dm"
        ? `dm_${roomId}`
        : roomType === "group"
        ? `group_${roomId}`
        : `channel_${roomId}`;

    socket.to(room).emit("user-stop-typing", {
      roomId,
      roomType,
      userId: socket.data.user.id,
    });
  });
};

export default typingSocket;
