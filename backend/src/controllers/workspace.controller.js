import { sendInviteEmail } from "../../config/email.verification.js";
import prisma from "../db/db.js";
import { generateJWT } from "../services/generate.cookie.js";
import { generateToken } from "../services/generate.token.js";
// Workspace controller: handles workspace CRUD, member management, and invite flow.

//  CREATE WORKSPACE
export const createWorkspace = async (req, res) => {
  try {
    // Validate request body
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    // Generate a URL-friendly slug for the workspace
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        owner: {
          connect: {
            id: req.user.id,
          },
        },
        members: {
          connect: [
            {
              id: req.user.id,
            },
          ],
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        members: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  GET USER WORKSPACES
export const getUserWorkspaces = async (req, res) => {
  try {
    // Fetch workspaces where current user is a member
    const admin = req.user.email;
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            id: req.user.id,
          },
        },
        isDeleted: false,
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

        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.json({ data: workspaces, admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  GET SINGLE WORKSPACE
export const getWorkspaceById = async (req, res) => {
  try {
    // Retrieve workspace with owner, members, and channels
    const userid = req.user.id;
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: req.params.workspaceId,
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        members: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        channels: true,
      },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    const userMember = await prisma.workspace.findFirst({
      where:{
        id: req.params.workspaceId,
        members: {
          some: {
            id: userid,
          },
        },
      },
    });
    if(!userMember){
      return res.status(403).json({ message: "Forbidden" });
      console.log("User is not a member of this workspace 😍");
      }



    const admin = workspace.owner.email  === req.user.email;
    res.json({ ...workspace, admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  UPDATE WORKSPACE
export const updateWorkspace = async (req, res) => {
  try {
    // Update workspace name/description if provided
    const { name, description } = req.body;

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: req.params.workspaceId,
      },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: {
        id: req.params.workspaceId,
      },
      data: {
        name: name || workspace.name,
        description: description || workspace.description,
      },
    });

    res.json(updatedWorkspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  DELETE WORKSPACE (SOFT)
export const deleteWorkspace = async (req, res) => {
  try {
    // Mark the workspace as deleted instead of removing it permanently
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: req.params.workspaceId,
      },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    await prisma.workspace.update({
      where: {
        id: req.params.workspaceId,
      },
      data: {
        isDeleted: true,
      },
    });

    res.json({ message: "Workspace deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  inviteWorkspace MEMBER
export const inviteWorkspaceMember = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email input
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Load workspace and current members
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: req.params.workspaceId,
      },

      include: {
        members: true,

        owner: {
          select: {
            fullName: true,
          },
        },
      },
    });

    // ✅ Workspace exists?
    if (!workspace) {
      console.error("Workspace not found");
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Prevent duplicate membership
    const memberExists = workspace.members.some(
      (member) => member.email === email
    );

    if (memberExists) {
      return res.status(400).json({
        message: "User is already a member of this workspace",
      });
    }

    // ✅ Existing pending invite?
    const existingInvite = await prisma.workspaceInvite.findFirst({
      where: {
        email,
        workspaceId: req.params.workspaceId,
        status: "pending",
      },
    });

    if (existingInvite) {
      return res.status(400).json({
        message: "Invitation already sent",
      });
    }

    // Create invite token and expiry
    const token = generateToken();

    console.log(`Generated token: ${token}`);

    // Expiry (24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Save invite in DB
    const invite = await prisma.workspaceInvite.create({
      data: {
        email,
        token,
        workspaceId: req.params.workspaceId,
        invitedById: req.user.id,
        expiresAt,
      },
    });

    // Build invite URL and send email
    const inviteLink = `${process.env.BASE_URL}/invite/${token}`;

    // Send invitation email
    await sendInviteEmail(
      email,
      workspace.name,
      inviteLink,
      workspace.owner.fullName
    );

    // Success response
    return res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      invite,
    });
  } catch (error) {
    console.error("❌ Invite Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

//  REMOVE MEMBER

export const removeWorkspaceMember = async (req, res) => {
  try {
    // Disconnect a member from the workspace
    const { userId } = req.params;

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: req.params.workspaceId,
      },
    });
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    await prisma.workspace.update({
      where: {
        id: req.params.workspaceId,
      },
      data: {
        members: {
          disconnect: [
            {
              id: userId,
            },
          ],
        },
      },
    });

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET WORKSPACE BY TOKEN
export const getWorkspaceByToken = async (req, res) => {
  try {
    // Validate invite token and return workspace + inviter info
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Invite token is required",
      });
    }

    const invite = await prisma.workspaceInvite.findUnique({
      where: {
        token,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            description: true,
            slug: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Invite exists?
    if (!invite) {
      return res.status(404).json({
        message: "Invite not found",
      });
    }

    // Invite expired?
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Invite link expired",
      });
    }

    // Invite already used?
    if (invite.status !== "pending") {
      return res.status(400).json({
        message: "Invite already used",
      });
    }

    return res.status(200).json({
      success: true,
      workspace: invite.workspace,
      invitedBy: invite.invitedBy.fullName,
      inviteId: invite.id,
      token: invite.token,
    });
  } catch (error) {
    console.error("Get Workspace By Token Error:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

// ACCEPT WORKSPACE INVITE// ACCEPT WORKSPACE INVITE
export const acceptWorkspaceInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const { name } = req.body;

    // Validate token
    if (!token) {
      return res.status(400).json({
        message: "Invite token is required",
      });
    }

    // Find invite
    const invite = await prisma.workspaceInvite.findUnique({
      where: {
        token,
      },
      include: {
        workspace: {
          include: {
            members: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },

        invitedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Invite exists?
    if (!invite) {
      return res.status(404).json({
        message: "Invite not found",
      });
    }

    // Invite expired?
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Invite link expired",
      });
    }

    // Invite already used?
    if (invite.status !== "pending") {
      return res.status(400).json({
        message: "Invite already used",
      });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: {
        email: invite.email,
      },

      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    // Create user if not exists
    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: name || "New User",
          email: invite.email,
          password: "", // optional password auth
          isVerified: true,
        },

        select: {
          id: true,
          fullName: true,
          email: true,
        },
      });
    }

    // Check if already member
    const alreadyMember = invite.workspace.members.some(
      (member) => member.id === user.id
    );

    // Add member if not already added
    let updatedWorkspace = invite.workspace;

    if (!alreadyMember) {
      updatedWorkspace = await prisma.workspace.update({
        where: {
          id: invite.workspaceId,
        },

        data: {
          members: {
            connect: {
              id: user.id,
            },
          },
        },

        include: {
          members: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });
    }

    // Mark invite as accepted
    await prisma.workspaceInvite.update({
      where: {
        id: invite.id,
      },

      data: {
        status: "accepted",
      },
    });

    // Generate auth token
    const generatedToken = generateJWT(user.id);

    // Set auth cookie
    res.cookie("token", generatedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Success response
    return res.status(200).json({
      success: true,
      message: "Workspace invite accepted successfully",

      workspace: {
        id: updatedWorkspace.id,
        name: updatedWorkspace.name,
        slug: updatedWorkspace.slug,
      },

      invitedBy: invite.invitedBy.fullName,

      user,

      token: generatedToken,
    });
  } catch (error) {
    console.error("Accept Workspace Invite Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
