import { Server } from "socket.io";

import { socketAuth } from "../middlewares/socketAuth.js";
import connectionSocket from "./connection.js";
import conversationSocket from "./conversation.socket.js";
import messageSocket from "./message.socket.js";
import presenceSocket from "./presence.socket.js";
import typingSocket from "./typing.socket.js";
import channelSocket from "./channel.socket.js";
import workspaceSocket from "./workspace.socket.js";
import callSocket from "./call.socket.js";
import notificationSocket from "./notification.socket.js";

const initSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("🚀 Socket Connected successfully:", socket.id);

    connectionSocket(io, socket);
    conversationSocket(io, socket);
    messageSocket(io, socket);
    presenceSocket(io, socket);
    typingSocket(io, socket);
    channelSocket(io, socket);
    workspaceSocket(io, socket);
    callSocket(io, socket);
    notificationSocket(io, socket);
  });

  return io;
};

export default initSockets;
