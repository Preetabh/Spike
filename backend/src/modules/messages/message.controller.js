import { prisma } from "../../lib/prisma.js";
import { redis } from "../../lib/redis.js";
import cloudinary from "../../utils/cloudinary.js";

/* =====================================
   SEND MESSAGE
===================================== */
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, mediaUrl, mediaType, messageType } = req.body;
    const senderId = req.user.id;

    if (!conversationId || (!content?.trim() && !mediaUrl)) {
      return res.status(400).json({
        message: "Conversation ID and either content or mediaUrl are required",
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

    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageId: message.id,
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
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

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

    const cacheKey = `conversation:messages:${conversationId}`;
    let messages = [];
    let cachedData = null;

    if (redis && !limit) {
      try {
        cachedData = await redis.get(cacheKey);
        if (cachedData) {
          messages = JSON.parse(cachedData);
        }
      } catch (err) {
        console.warn("Redis read error:", err.message);
      }
    }

    if (!cachedData) {
      messages = await prisma.message.findMany({
        where: {
          conversationId,
          isDeleted: false,
          deletedFor: {
            none: {
              id: userId,
            },
          },
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
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
            },
          },
        },
        orderBy: {
          createdAt: limit ? "desc" : "asc",
        },
        take: limit,
      });

      if (redis && !limit) {
        try {
          await redis.set(cacheKey, JSON.stringify(messages), "EX", 300); // cache for 5 minutes
        } catch (err) {
          console.warn("Redis write error:", err.message);
        }
      }
    }

    if (limit) {
      messages.reverse();
    }

    // Mark messages as seen by connecting the user to seenBy relation
    const unseenMessages = messages.filter(
      (m) => m.senderId !== userId && !m.seenBy.some((u) => u.id === userId)
    );

    if (unseenMessages.length > 0) {
      await Promise.all(
        unseenMessages.map((m) =>
          prisma.message.update({
            where: { id: m.id },
            data: {
              seenBy: {
                connect: { id: userId },
              },
            },
          })
        )
      );

      // Add the user to the local object so response includes it
      unseenMessages.forEach((m) => {
        m.seenBy.push({ id: userId });
      });

      const io = req.app.get("io");
      if (io) {
        io.to(`conversation_${conversationId}`).emit("messages-seen", {
          conversationId,
          userId,
          messageIds: unseenMessages.map((m) => m.id),
        });
      }
    }

    // Update conversation read tracking for this user
    if (messages.length > 0) {
      const lastReadMessageId = messages[messages.length - 1].id;
      await prisma.conversationRead.upsert({
        where: {
          userId_conversationId: {
            userId,
            conversationId,
          },
        },
        create: {
          userId,
          conversationId,
          lastReadMessageId,
        },
        update: {
          lastReadMessageId,
          updatedAt: new Date(),
        },
      });
    }

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
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
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
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation_${message.conversationId}`).emit("message-edited", updatedMessage);
    }

    res.json(updatedMessage);
  } catch (error) {
    next(error);
  }
};

/* =====================================
   DELETE MESSAGE
===================================== */
export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { type = "everyone" } = req.body; // "me" or "everyone"

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (type === "everyone") {
      if (message.senderId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await prisma.message.update({
        where: { id: messageId },
        data: {
          isDeleted: true,
        },
      });

      const io = req.app.get("io");
      if (io) {
        io.to(`conversation_${message.conversationId}`).emit("message-deleted", {
          messageId,
          conversationId: message.conversationId,
          type: "everyone",
        });
      }
    } else if (type === "me") {
      await prisma.message.update({
        where: { id: messageId },
        data: {
          deletedFor: {
            connect: { id: req.user.id },
          },
        },
      });
    }

    res.json({ message: "Message deleted successfully", type });
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
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation_${message.conversationId}`).emit("reaction-updated", {
        messageId,
        conversationId: message.conversationId,
        action: "added",
        reaction,
      });
    }

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
    const { emoji } = req.body;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) return res.status(404).json({ message: "Message not found" });

    await prisma.messageReaction.deleteMany({
      where: {
        messageId,
        userId: req.user.id,
        ...(emoji ? { emoji } : {}),
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation_${message.conversationId}`).emit("reaction-updated", {
        messageId,
        conversationId: message.conversationId,
        action: "removed",
        userId: req.user.id,
        emoji,
      });
    }

    res.json({ message: "Reaction removed" });
  } catch (error) {
    next(error);
  }
};

/* =====================================
   UPLOAD ATTACHMENT
===================================== */
export const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Determine type: image, video, audio, or raw file
    let mediaType = "file";
    if (req.file.mimetype.startsWith("image/")) {
      mediaType = "image";
    } else if (req.file.mimetype.startsWith("video/")) {
      mediaType = "video";
    } else if (req.file.mimetype.startsWith("audio/")) {
      mediaType = "audio";
    }

    // Cloudinary uploader expects a base64 or stream. We upload a base64 string
    const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    
    // Set cloudinary resource type dynamically based on mediaType (video, raw, image)
    let resourceType = "raw";
    if (mediaType === "image") {
      resourceType = "image";
    } else if (mediaType === "video" || mediaType === "audio") {
      resourceType = "video";
    }

    const uploadResult = await cloudinary.uploader.upload(base64File, {
      resource_type: resourceType,
      folder: "spike-attachments",
    });

    return res.status(200).json({
      url: uploadResult.secure_url,
      mediaType,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });
  } catch (error) {
    next(error);
  }
};
