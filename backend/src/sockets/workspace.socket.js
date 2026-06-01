/* =========================================================
   ENTERPRISE WORKSPACE SOCKET SYSTEM (Slack-Level)
========================================================= */

import { prisma } from "../lib/prisma.js";

// workspaceId -> Set of active userIds
const activeWorkspaceUsers = new Map();

const workspaceSocket = (io, socket) => {
  /* ==============================
     JOIN WORKSPACE
  ============================== */
  socket.on("joinWorkspace", async ({ workspaceId }) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: { some: { id: socket.data.user.id } },
      },
    });

    if (!workspace) return;
    socket.join(`workspace_${workspaceId}`);
    io.to(`workspace_${workspaceId}`).emit("workspace-user-online", {
      workspaceId,
      userId: socket.data.user.id,
    });

    if (!activeWorkspaceUsers.has(workspaceId)) {
      activeWorkspaceUsers.set(workspaceId, new Set());
    }

    activeWorkspaceUsers.get(workspaceId).add(socket.data.user.id);

    io.to(`workspace_${workspaceId}`).emit("workspaceUsersUpdate", {
      workspaceId,
      users: Array.from(activeWorkspaceUsers.get(workspaceId)),
    });
  });

  /* ==============================
     LEAVE WORKSPACE
  ============================== */
  socket.on("leaveWorkspace", ({ workspaceId }) => {
    socket.leave(`workspace_${workspaceId}`);
    io.to(`workspace_${workspaceId}`).emit("workspace-user-offline", {
      workspaceId,
      userId: socket.data.user.id,
    });

    if (activeWorkspaceUsers.has(workspaceId)) {
      activeWorkspaceUsers.get(workspaceId).delete(socket.data.user.id);

      io.to(`workspace_${workspaceId}`).emit("workspaceUsersUpdate", {
        workspaceId,
        users: Array.from(activeWorkspaceUsers.get(workspaceId)),
      });
    }
  });

  /* ==============================
     WORKSPACE BROADCAST (Admin)
  ============================== */
  socket.on("workspaceAnnouncement", ({ workspaceId, message }) => {
    io.to(`workspace_${workspaceId}`).emit("newWorkspaceAnnouncement", {
      message,
      createdAt: new Date(),
      createdBy: socket.user?._id,
    });
  });

  /* ==============================
     DISCONNECT CLEANUP
  ============================== */
  socket.on("disconnect", () => {
    activeWorkspaceUsers.forEach((users, workspaceId) => {
      if (socket.user && users.has(socket.user._id.toString())) {
        users.delete(socket.user._id.toString());

        io.to(`workspace_${workspaceId}`).emit("workspaceUsersUpdate", {
          workspaceId,
          users: Array.from(users),
        });
      }
    });
  });
};

export default workspaceSocket;
