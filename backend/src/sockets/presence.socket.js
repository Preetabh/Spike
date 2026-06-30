const onlineUsers = new Set();

const presenceSocket = (io, socket) => {
  socket.on("user-online", (userId) => {
    onlineUsers.add(userId);

    io.emit("online-users", [...onlineUsers]);
  });

  socket.on("disconnect", () => {
    io.emit("online-users", [...onlineUsers]);
  });
};

export default presenceSocket;
