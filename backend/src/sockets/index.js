import { Server } from "socket.io";

import connectionSocket from "./connection.js";
import conversationSocket from "./conversation.socket.js";
import messageSocket from "./message.socket.js";
import presenceSocket from "./presence.socket.js";

const initSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    connectionSocket(io, socket);
    conversationSocket(io, socket);
    messageSocket(io, socket);
    presenceSocket(io, socket);
  });

  return io;
};

export default initSockets;
