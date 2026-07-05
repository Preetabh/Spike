import prisma from "../../db/db.js";

/* ======================================================
   CREATE CHANNEL
====================================================== */
export const createChannel = async (req, res, next) => {
  try {
    const { name, workspaceId, type = "public", description = "" } = req.body;

    if (!name || !workspaceId) {
      return res.status(400).json({ message: "Name and workspaceId required" });
    }

    // Verify user is member of workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: { some: { id: req.user.id } },
      },
    });

    if (!workspace) {
      return res.status(403).json({ message: "Access denied" });
    }

    const conversationType = type === "private" ? "private_channel" : "workspace_channel";

    const channel = await prisma.conversation.create({
      data: {
        title: name,
        description,
        type: conversationType,
        workspaceId,
        createdById: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: "admin",
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(channel);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   GET WORKSPACE CHANNELS
====================================================== */
export const getWorkspaceChannels = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspace || req.query.workspaceId || req.params.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ message: "Workspace ID is required" });
    }

    const channels = await prisma.conversation.findMany({
      where: {
        workspaceId,
        type: {
          in: ["workspace_channel", "private_channel"],
        },
        members: {
          some: {
            userId: req.user.id,
          },
        },
        isDeleted: false,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json(channels);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   GET SINGLE CHANNEL
====================================================== */
export const getChannelById = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const channel = await prisma.conversation.findFirst({
      where: {
        id: channelId,
        type: {
          in: ["workspace_channel", "private_channel"],
        },
        members: {
          some: {
            userId: req.user.id,
          },
        },
        isDeleted: false,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found or access denied" });
    }

    res.status(200).json(channel);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   UPDATE CHANNEL
====================================================== */
export const updateChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { name, description } = req.body;

    const channel = await prisma.conversation.findUnique({
      where: { id: channelId },
    });

    if (!channel || channel.isDeleted) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const updated = await prisma.conversation.update({
      where: { id: channelId },
      data: {
        title: name || channel.title,
        description: description !== undefined ? description : channel.description,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   SOFT DELETE CHANNEL
====================================================== */
export const deleteChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    await prisma.conversation.update({
      where: { id: channelId },
      data: { isDeleted: true },
    });

    res.status(200).json({ message: "Channel deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   ARCHIVE CHANNEL
====================================================== */
export const archiveChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const updated = await prisma.conversation.update({
      where: { id: channelId },
      data: { isArchived: true },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   ADD MEMBER TO CHANNEL
====================================================== */
export const addChannelMember = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { userId, role = "member" } = req.body;

    const existing = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: channelId,
          userId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: "User is already a member" });
    }

    const newMember = await prisma.conversationMember.create({
      data: {
        conversationId: channelId,
        userId,
        role,
      },
    });

    res.status(201).json(newMember);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   REMOVE MEMBER FROM CHANNEL
====================================================== */
export const removeChannelMember = async (req, res, next) => {
  try {
    const { channelId, userId } = req.params;

    await prisma.conversationMember.delete({
      where: {
        conversationId_userId: {
          conversationId: channelId,
          userId,
        },
      },
    });

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    next(error);
  }
};
