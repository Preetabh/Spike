import { prisma } from "../lib/prisma.js";

// In-memory set of online user IDs
const onlineUsers = new Set();

const presenceSocket = async (io, socket) => {
  const userId = socket.data?.user?.id;
  if (!userId) return;

  // Add user to online users set
  onlineUsers.add(userId);

  try {
    // Update user status in database to online
    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: true,
        socketId: socket.id,
      },
    });

    console.log(`🟢 User ${socket.data.user.fullName} (${userId}) is online`);
  } catch (error) {
    console.error(`❌ Error setting user online in DB:`, error);
  }

  // Broadcast the list of online user IDs to all clients
  io.emit("online-users", Array.from(onlineUsers));

  // Handle user disconnect
  socket.on("disconnect", async () => {
    onlineUsers.delete(userId);

    try {
      // Update user status in database to offline
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline: false,
          lastSeen: new Date(),
          socketId: null,
        },
      });

      console.log(`🔴 User ${socket.data?.user?.fullName || userId} went offline`);
    } catch (error) {
      console.error(`❌ Error setting user offline in DB:`, error);
    }

    // Broadcast the updated list of online user IDs
    io.emit("online-users", Array.from(onlineUsers));
  });
};

export default presenceSocket;
