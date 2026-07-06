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
    let existingDM = await prisma.conversation.findFirst({
      where: {
        type: "dm",
        members: {
          some: {
            userId: currentUser,
          },
        },
        AND: [
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
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

    if (existingDM) {
      return res.status(200).json(existingDM);
    }

    // 🔥 Create new DM conversation
    const dm = await prisma.conversation.create({
      data: {
        title: "Direct Message",
        type: "dm",
        createdById: currentUser,
        members: {
          create: [
            {
              userId: currentUser,
            },
            {
              userId,
            },
          ],
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
            lastSeen: true,
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

    // Fetch all DM conversations in this workspace for current user
    const dmConversations = await prisma.conversation.findMany({
      where: {
        workspaceId,
        type: "dm",
        members: {
          some: {
            userId,
          },
        },
        isDeleted: false,
      },
      include: {
        members: {
          select: {
            userId: true,
          },
        },
        lastMessage: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
        reads: {
          where: {
            userId,
          },
        },
      },
    });

    // Map members to include conversation info
    const membersWithChatInfo = await Promise.all(
      filteredMembers.map(async (member) => {
        // Find conversation with this member
        const conv = dmConversations.find((c) =>
          c.members.some((m) => m.userId === member.id)
        );

        if (!conv) {
          return {
            ...member,
            conversationId: null,
            lastMessage: null,
            unreadCount: 0,
          };
        }

        // Calculate unread count
        const readStatus = conv.reads[0];
        let unreadCount = 0;

        if (readStatus) {
          unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              createdAt: {
                gt: readStatus.updatedAt,
              },
              senderId: {
                not: userId,
              },
              isDeleted: false,
            },
          });
        } else {
          unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              senderId: {
                not: userId,
              },
              isDeleted: false,
            },
          });
        }

        return {
          ...member,
          conversationId: conv.id,
          lastMessage: conv.lastMessage,
          unreadCount,
        };
      })
    );

    res.status(200).json(membersWithChatInfo);
  } catch (error) {
    next(error);
  }
};


// GET SINGLE DM
export const getDMById = async (req, res, next) => {
  try {
    console.log("I am so happy api is successfully hit");
    const { dmId } = req.params;
    const { workspaceId } = req.query;
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
            lastSeen: true,
          },
        },
      },
    });

    if (!workspace || workspace.members.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        type: "dm",
        members: {
          some: {
            userId: currentUser,
          },
        },
        AND: [
          {
            members: {
              some: {
                userId: dmId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        type: true,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          title: "Direct Message",
          type: "dm",
          createdById: currentUser,
          workspaceId: workspaceId,
          members: {
            create: [
              {
                userId: currentUser,
              },
              {
                userId: dmId,
              },
            ],
          },
        },
        select: {
          id: true,
          type: true,
        },
      });
    }

    res.status(200).json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
      },
      conversation,
      user: workspace.members[0],
      messages: [],
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

    const dm = await prisma.conversation.findFirst({
      where: {
        id: dmId,
        type: "dm",
        members: {
          some: {
            userId: req.user.id,
          },
        },
      },
    });

    if (!dm) {
      return res.status(404).json({ message: "DM not found" });
    }

    await prisma.conversation.update({
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
