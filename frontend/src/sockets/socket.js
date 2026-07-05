import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (typeof window === "undefined") return null;

  const currentToken = localStorage.getItem("token");

  // If socket already exists, check if token is updated
  if (socket) {
    if (socket.auth && socket.auth.token === currentToken) {
      return socket;
    } else {
      console.log("🚀 Socket: Token changed or initialized. Reconnecting socket...");
      socket.disconnect();
      socket = null;
    }
  }

  if (!currentToken) {
    console.log("⚠️ Socket: No token found in localStorage, postponing connection.");
    return null;
  }

  socket = io(process.env.NEXT_PUBLIC_BASE_URL, {
    path: "/socket.io",
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: {
      token: currentToken,
    },
  });

  socket.on("connect", () => {
    console.log("🚀 Socket Connected successfully:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket Disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("⚠️ Socket Connect Error:", error.message);
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
