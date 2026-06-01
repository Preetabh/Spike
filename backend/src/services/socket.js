import { Server } from "socket.io";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("joinWorkspace", (workspaceId) => {
      socket.join(workspaceId);
    });

    socket.on("joinChannel", (channelId) => {
      socket.join(channelId);
    });

    socket.on("sendMessage", (data) => {
      io.to(data.channelId).emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected");
    });
  });

  return io;
};
