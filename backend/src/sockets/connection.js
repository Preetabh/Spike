import { prisma } from "../lib/prisma.js";

const connectionSocket = async (io, socket) => {
  const userId = socket.data?.user?.id;
  if (userId) {
    try {
      // Find all conversations this user is a member of
      const memberships = await prisma.conversationMember.findMany({
        where: {
          userId,
        },
        select: {
          conversationId: true,
        },
      });

      memberships.forEach((membership) => {
        socket.join(`conversation_${membership.conversationId}`);
      });
      console.log(`🚀 Socket: Auto-joined ${memberships.length} conversation rooms for user ${userId}`);
    } catch (err) {
      console.error("❌ Error auto-joining conversation rooms:", err);
    }
  }

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
};

export default connectionSocket;
