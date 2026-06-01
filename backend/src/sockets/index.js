import { Server } from "socket.io";
import { socketAuth } from "../middlewares/socketAuth.js";
import channelSocket from "./channel.socket.js";
import messageSocket from "./message.socket.js";
import notificationSocket from "./notification.socket.js";
import presenceSocket from "./presence.socket.js";
import typingSocket from "./typing.socket.js";
import workspaceSocket from "./workspace.socket.js";

const initSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
    pingTimeout: 30000,
    transports: ["websocket", "polling"],
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    presenceSocket(io, socket);
    workspaceSocket(io, socket);
    channelSocket(io, socket);
    messageSocket(io, socket);
    typingSocket(io, socket);
    notificationSocket(io, socket);
  });

  return io;
};

export default initSockets;
