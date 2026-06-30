const connectionSocket = (io, socket) => {
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
};

export default connectionSocket;
