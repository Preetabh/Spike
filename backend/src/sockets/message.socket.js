import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";
import { sendPushNotification } from "../lib/push.js";

const messageSocket = (io, socket) => {
  socket.on(
    "send-message",
    async ({ conversationId, content, mediaUrl, mediaType, messageType }) => {
      try {
        const senderId = socket.data.user.id;

        if (!content?.trim() && !mediaUrl) {
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
            content: content?.trim() || "",
            mediaUrl: mediaUrl || null,
            mediaType: mediaType || null,
            messageType: messageType || "text",
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

        // Invalidate Redis cache
        if (redis) {
          try {
            await redis.del(`conversation:messages:${conversationId}`);
          } catch (err) {
            console.warn("Redis delete error:", err.message);
          }
        }

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

        // 🔥 Broadcast Firebase Cloud Messaging Push Alerts Asynchronously
        prisma.conversationMember.findMany({
          where: {
            conversationId,
            userId: { not: senderId },
          },
          include: {
            user: {
              select: {
                fullName: true,
                fcmToken: true,
              },
            },
            conversation: {
              select: {
                type: true,
                title: true,
                name: true,
              },
            },
          },
        }).then((membersList) => {
          membersList.forEach((m) => {
            if (m.user?.fcmToken) {
              let title = "New Message";
              const conv = m.conversation;

              if (conv?.type === "dm") {
                title = message.sender?.fullName || "Spike User";
              } else if (conv?.type === "private_channel" || conv?.type === "workspace_channel") {
                title = `#${conv.title || conv.name || "channel"}`;
              } else if (conv?.type === "group") {
                title = `👥 ${conv.title || conv.name || "group"}`;
              }

              sendPushNotification(
                m.user.fcmToken,
                title,
                `${message.sender?.fullName || "User"}: ${content.trim()}`,
                { conversationId }
              );
            }
          });
        }).catch((err) => {
          console.error("[FCM Broadcast Error]:", err);
        });

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

  socket.on(
    "mark-seen",
    async ({ conversationId }) => {
      try {
        const userId = socket.data?.user?.id;
        if (!userId || !conversationId) return;

        const unseenMessages = await prisma.message.findMany({
          where: {
            conversationId,
            senderId: { not: userId },
            seenBy: {
              none: { id: userId },
            },
          },
          select: { id: true },
        });

        if (unseenMessages.length > 0) {
          const messageIds = unseenMessages.map((m) => m.id);
          await Promise.all(
            messageIds.map((id) =>
              prisma.message.update({
                where: { id },
                data: {
                  seenBy: {
                    connect: { id: userId },
                  },
                },
              })
            )
          );

          io.to(`conversation_${conversationId}`).emit("messages-seen", {
            conversationId,
            userId,
            messageIds,
          });
        }
      } catch (error) {
        console.error("Socket mark-seen Error:", error);
      }
    }
  );
};

export default messageSocket;
