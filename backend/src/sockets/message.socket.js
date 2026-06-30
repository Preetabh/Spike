import { prisma } from "../lib/prisma.js";

const messageSocket = (io, socket) => {
  socket.on(
    "send-message",
    async ({ conversationId, content }) => {
      try {
        const senderId = socket.data.user.id;

        if (!content?.trim()) {
          return;
        }

        const member =
          await prisma.conversationMember.findFirst({
            where: {
              conversationId,
              userId: senderId,
            },
          });

        if (!member) {
          return socket.emit("message-error", {
            message: "Access denied",
          });
        }

        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId,
            content: content.trim(),
          },
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        });

        await prisma.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            lastMessageId: message.id,
          },
        });

        io.to(
          `conversation_${conversationId}`
        ).emit("receive-message", message);
      } catch (error) {
        console.error(
          "Send Message Error:",
          error
        );

        socket.emit("message-error", {
          message: "Failed to send message",
        });
      }
    }
  );
};

export default messageSocket;
