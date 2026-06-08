import { prisma } from "../../lib/prisma.js";

// CREATE OR GET DM (1-to-1)
export const createOrGetDM = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    if (userId === currentUser.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot create DM with yourself" });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔍 Check if DM already exists
    let existingDM = await prisma.channel.findFirst({
      where: {
        type: "dm",
        members: {
          every: {
            id: {
              in: [currentUser, userId],
            },
          },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (existingDM) {
      return res.status(200).json(existingDM);
    }

    // 🔥 Create new DM channel
    const dm = await prisma.channel.create({
      data: {
        name: "direct-message",
        type: "dm",
        createdById: currentUser,
        members: {
          connect: [{ id: currentUser }, { id: userId }],
        },
      },
      include: {
        members: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(dm);
  } catch (error) {
    next(error);
  }
};


// GET ALL USER DMs
export const getUserDMs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ message: "Plz provide workspaceId" });
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            isOnline: true,
          },
        },
      },
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const filteredMembers = workspace.members.filter(
      (member) => member.id !== userId
    );

    console.log("Members found:", filteredMembers.length);

    res.status(200).json(filteredMembers);
  } catch (error) {
    next(error);
  }
};


// GET SINGLE DM
export const getDMById = async (req, res, next) => {
  try {
    console.log("I am so happy api is successfully hit");
    const { dmId } = req.params;
    const { workspaceId } = req.params;
    const currentUser = req.user.id;

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: {
          some: {
            id: currentUser,
          },
        },
      },
      select: {
        id: true,
        name: true,
        members: {
          where: {
            id: dmId,
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            isOnline: true,
          },
        },
      },
    });

    if (!workspace || workspace.members.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
      },
      user: workspace.members[0],
    });
  } catch (error) {
    console.error("Error fetching DM by ID:", error);
    next(error);
  }
};


// DELETE / LEAVE DM (Soft)
export const deleteDM = async (req, res, next) => {
  try {
    const { dmId } = req.params;

    const dm = await prisma.channel.findFirst({
      where: {
        id: dmId,
        type: "dm",
        members: {
          some: {
            id: req.user.id,
          },
        },
      },
    });

    if (!dm) {
      return res.status(404).json({ message: "DM not found" });
    }

    await prisma.channel.update({
      where: {
        id: dmId,
      },
      data: {
        isDeleted: true,
      },
    });

    res.status(200).json({ message: "DM deleted successfully" });
  } catch (error) {
    next(error);
  }
};
