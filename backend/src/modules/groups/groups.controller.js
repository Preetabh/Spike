import prisma from "../../db/db.js";

// GET ALL GROUPS OF WORKSPACE
export const getWorkspaceGroups = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspace || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ message: "Workspace ID is required" });
    }

    const groups = await prisma.conversation.findMany({
      where: {
        workspaceId,
        type: "group",
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

    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
};

// GET GROUP BY ID
export const getGroupById = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await prisma.conversation.findFirst({
      where: {
        id: groupId,
        type: "group",
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

    if (!group) {
      return res.status(404).json({ message: "Group not found or access denied" });
    }

    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
};

// CREATE GROUP
export const createGroup = async (req, res, next) => {
  try {
    const { name, workspaceId, description = "", members = [] } = req.body;

    if (!name || !workspaceId) {
      return res.status(400).json({ message: "Name and workspaceId required" });
    }

    const uniqueUserIds = [...new Set([...members, req.user.id])];

    const group = await prisma.conversation.create({
      data: {
        title: name,
        description,
        type: "group",
        workspaceId,
        createdById: req.user.id,
        members: {
          create: uniqueUserIds.map((userId) => ({
            userId,
            role: userId === req.user.id ? "admin" : "member",
          })),
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

    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};
