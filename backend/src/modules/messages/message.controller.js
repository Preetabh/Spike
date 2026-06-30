import { prisma } from "../../lib/prisma.js";

/* =====================================
   SEND MESSAGE
===================================== */
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user.id;

    if (!conversationId || !content?.trim()) {
      return res.status(400).json({
        message: "Conversation ID and content are required",
      });
    }

    const member = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: senderId,
      },
    });

    if (!member) {
      return res.status(403).json({
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

    const io = req.app.get("io");

    if (io) {
      io.to(`conversation_${conversationId}`).emit("receive-message", message);
    }

    return res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

// get all messages By User Id
export const getMessageById = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { workspaceId } = req.body;
    const currentUser = req.user.id;

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          workspaceId,
          members: {
            some: {
              userId: currentUser,
            },
          },
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });
    console.log(message);

    if (!message) {
      return res.status(404).json({
        message: "Message not found or access denied",
      });
    }

    return res.status(200).json({
      message,
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================
   GET CONVERSATION MESSAGES
===================================== */
export const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const member = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!member) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
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
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

/* =====================================
   EDIT MESSAGE
===================================== */
export const editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.senderId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
    });

    res.json(updatedMessage);
  } catch (error) {
    next(error);
  }
};

/* =====================================
   DELETE MESSAGE (SOFT)
===================================== */
export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.senderId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
      },
    });

    res.json({ message: "Message deleted" });
  } catch (error) {
    next(error);
  }
};

/* =====================================
   ADD REACTION
===================================== */
export const addReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) return res.status(404).json({ message: "Message not found" });

    const reaction = await prisma.messageReaction.create({
      data: {
        messageId,
        userId: req.user.id,
        emoji,
      },
    });

    res.json(reaction);
  } catch (error) {
    next(error);
  }
};

/* =====================================
   REMOVE REACTION
===================================== */
export const removeReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    await prisma.messageReaction.deleteMany({
      where: {
        messageId,
        userId: req.user.id,
      },
    });

    res.json({ message: "Reaction removed" });
  } catch (error) {
    next(error);
  }
};
