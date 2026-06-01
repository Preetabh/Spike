import dotenv from "dotenv";
import http from "http";
dotenv.config();

import app from "./src/app.js";
import prisma, { connectDb } from "./src/db/db.js";
import initSockets from "./src/sockets/index.js";

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// 🔥 Create HTTP server
const server = http.createServer(app);

// 🔥 Initialize Socket.IO
const io = initSockets(server);

// Make io available inside controllers via req.app.get("io")
app.set("io", io);

const startServer = async () => {
  try {
    await connectDb();

    server.listen(PORT, () => {
      console.log(
        `🚀 Server + Socket running on port ${PORT} in ${NODE_ENV} mode`
      );
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
};

startServer();

// 🔥 Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  process.exit(1);
});

// 🔥 Graceful Shutdown
process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received. Closing server...");

  await prisma.$disconnect();

  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
});

process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received. Closing server...");

  await prisma.$disconnect();

  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
});
