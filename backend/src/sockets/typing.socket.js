const typingSocket = (io, socket) => {
  /* ==============================
     USER START TYPING
  ============================== */
  socket.on("typing-start", ({ conversationId }) => {
    if (!conversationId) return;

    socket.to(`conversation_${conversationId}`).emit("user-typing", {
      conversationId,
      user: {
        id: socket.data.user.id,
        fullName: socket.data.user.fullName,
      },
    });
  });

  /* ==============================
     USER STOP TYPING
  ============================== */
  socket.on("typing-stop", ({ conversationId }) => {
    if (!conversationId) return;

    socket.to(`conversation_${conversationId}`).emit("user-stop-typing", {
      conversationId,
      userId: socket.data.user.id,
    });
  });
};

export default typingSocket;
