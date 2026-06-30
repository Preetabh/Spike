import { prisma } from "../lib/prisma.js";

const conversationSocket = (io, socket) => {
  socket.on(
    "join-conversation",
    async ({ conversationId }) => {
      try {
        const userId = socket.data.user.id;

        const member =
          await prisma.conversationMember.findFirst({
            where: {
              conversationId,
              userId,
            },
          });

        if (!member) {
          return socket.emit(
            "conversation-error",
            {
              message: "Access denied",
            }
          );
        }

        socket.join(
          `conversation_${conversationId}`
        );

        socket.emit(
          "conversation-joined",
          {
            conversationId,
          }
        );
      } catch (error) {
        console.error(
          "Join Conversation Error:",
          error
        );

        socket.emit(
          "conversation-error",
          {
            message:
              "Failed to join conversation",
          }
        );
      }
    }
  );

  socket.on(
    "leave-conversation",
    ({ conversationId }) => {
      socket.leave(
        `conversation_${conversationId}`
      );
    }
  );
};

export default conversationSocket;
