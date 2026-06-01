import jwt from "jsonwebtoken";
import workspaceSocket from "./workspace.socket.js";
import channelSocket from "./channel.socket.js";
import messageSocket from "./message.socket.js";
import typingSocket from "./typing.socket.js";
import presenceSocket from "./presence.socket.js";
import callSocket from "./call.socket.js";
import notificationSocket from "./notification.socket.js";

const registerConnection = (io) => {

  // 🔐 SOCKET AUTH MIDDLEWARE
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("Invalid Token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🔌 User Connected:", socket.user._id);

    workspaceSocket(io, socket);
    channelSocket(io, socket);
    messageSocket(io, socket);
    typingSocket(io, socket);
    presenceSocket(io, socket);
    callSocket(io, socket);
    notificationSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ User Disconnected:", socket.user._id);
    });
  });
};

export default registerConnection;
