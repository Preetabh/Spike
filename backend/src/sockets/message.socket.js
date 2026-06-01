//  ENTERPRISE MESSAGE SOCKET SYSTEM (Slack-Level)

import { prisma } from "../lib/prisma.js";

const messageSocket = (io, socket) => {
  

  //  SEND MESSAGE (Real-time Emit)
  socket.on(
    "send-message",
    async ({ channelId, content, mediaUrl, mediaType, parentMessageId }) => {
      if (!content && !mediaUrl) return;

      const userId = socket.data.user.id;
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) return;

      const message = await prisma.message.create({
        data: {
          content: content || "",
          mediaUrl,
          mediaType,
          parentMessageId,
          senderId: userId,
          channelId,
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              isOnline: true,
            },
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatar: true,
                },
              },
            },
          },
          seenBy: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      await prisma.channel.update({
        where: { id: channelId },
        data: { lastMessageId: message.id },
      });

      const room =
        channel.type === "dm"
          ? `dm_${channelId}`
          : channel.type === "group"
          ? `group_${channelId}`
          : `channel_${channelId}`;

      io.to(room).emit("receive-message", message);
    }
  );

  //  EDIT MESSAGE
  socket.on("edit-message", async ({ messageId, content }) => {
    const userId = socket.data.user.id;
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId,
        isDeleted: false,
      },
    });

    if (!message) return;

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
    });

    io.to(`channel_${message.channelId}`).emit(
      "message-edited",
      updatedMessage
    );
  });

  //  DELETE MESSAGE
  socket.on("delete-message", async ({ messageId }) => {
    const userId = socket.data.user.id;
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId,
      },
    });

    if (!message) return;

    await prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    io.to(`channel_${message.channelId}`).emit("message-deleted", {
      messageId,
      channelId: message.channelId,
    });
  });

  //  ADD REACTION
  socket.on("react-message", async ({ messageId, emoji }) => {
    const userId = socket.data.user.id;
    const existingReaction = await prisma.messageReaction.findFirst({
      where: { messageId, userId, emoji },
    });

    let reaction = null;
    let action = "added";

    if (existingReaction) {
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id },
      });
      action = "removed";
    } else {
      reaction = await prisma.messageReaction.create({
        data: { messageId, userId, emoji },
        include: {
          user: {
            select: { id: true, fullName: true, avatar: true },
          },
        },
      });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { channelId: true },
    });

    if (!message) return;

    io.to(`channel_${message.channelId}`).emit("message-reaction", {
      messageId,
      emoji,
      userId,
      action,
      reaction,
    });
  });

  //  MESSAGE SEEN (Read Receipt)
  socket.on("mark-seen", async ({ channelId }) => {
    const userId = socket.data.user.id;
    const messages = await prisma.message.findMany({
      where: {
        channelId,
        senderId: { not: userId },
        seenBy: { none: { id: userId } },
      },
      select: { id: true },
    });

    if (!messages.length) return;

    await Promise.all(
      messages.map((message) =>
        prisma.message.update({
          where: { id: message.id },
          data: {
            seenBy: {
              connect: {
                id: userId,
              },
            },
          },
        })
      )
    );

    io.to(`channel_${channelId}`).emit("messages-seen", {
      channelId,
      userId,
      messageIds: messages.map((message) => message.id),
    });
  });

  //  MESSAGE ERROR HANDLING
  socket.on("messageError", (error) => {
    console.error("Message Socket Error:", error);
  });
};

export default messageSocket;
