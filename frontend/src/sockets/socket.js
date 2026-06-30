
import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (typeof window === "undefined") return null;

  if (socket) return socket;

  socket = io(process.env.NEXT_PUBLIC_BASE_URL, {
    path: "/socket.io",
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: {
      token: localStorage.getItem("token"),
    },
  });

  socket.on("connect", () => {
    console.log("Socket Connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket Disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket Error:", error.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
