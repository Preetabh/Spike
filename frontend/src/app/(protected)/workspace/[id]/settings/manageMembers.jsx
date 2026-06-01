"use client";

import { useMutation } from "@tanstack/react-query";
import { Crown, Mail, MoreVertical, UserPlus, Users, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const ManageMembers = ({ workspace }) => {
  const [email, setEmail] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [members, setMembers] = useState(workspace?.members || []);
  const [activeMemberMenu, setActiveMemberMenu] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    setMembers(workspace?.members || []);
  }, [workspace?.members]);

  const { mutate: inviteWorkspaceMember, isPending: isInviting } = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspaces/${id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send invite");
      }

      return data;
    },

    onSuccess: () => {
      toast.success("Invitation sent successfully 🎉");

      setEmail("");
      setShowInviteModal(false);
    },

    onError: (error) => {
      console.error(error);

      toast.error(error.message || "Failed to send invitation");
    },
  });

  const { mutate: removeWorkspaceMember, isPending: isRemoving } = useMutation({
    mutationFn: async (userId) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspaces/${id}/members/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove member");
      }

      return { userId };
    },

    onSuccess: (_, userId) => {
      toast.success("Member removed successfully");
      setMembers((prev) => prev.filter((member) => member.id !== userId));
    },

    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to remove member");
    },
  });

  const handleInviteMember = () => {
    if (!email) {
      toast.error("Please enter email");
      return;
    }

    inviteWorkspaceMember();
  };

  const handleRemoveMember = (memberId) => {
    if (confirm("Deactivate this user and remove them from the workspace?")) {
      setActiveMemberMenu(null);
      removeWorkspaceMember(memberId);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h2 className="text-3xl font-bold text-[color:var(--accent)] flex items-center gap-3">
            <Users size={30} />
            Manage Members
          </h2>

          <p className="text-[color:var(--muted-foreground)] mt-2">
            Invite and manage your workspace collaborators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[color:var(--sidebar-accent)] text-[color:var(--sidebar-accent-foreground)] font-medium shadow-sm">
            {workspace?.members?.length || 0} Members
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--accent)] text-white font-medium shadow-sm hover:opacity-95 transition"
            aria-label="Open invite modal"
          >
            <UserPlus size={16} />
            Invite
          </button>
        </div>
      </div>

      {/* Modal: Invite Popup */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowInviteModal(false)}
          />

          {/* Modal Panel */}
          <div className="relative w-full max-w-md mx-4 bg-[color:var(--background)] border border-[color:var(--border)] rounded-3xl p-6 shadow-xl z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <UserPlus size={20} />
                <h4 className="text-lg font-semibold">Invite Member</h4>
              </div>

              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 rounded-full hover:bg-[color:var(--card)]"
                aria-label="Close invite modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted-foreground)]"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter member email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[color:var(--card)] border border-[color:var(--border)] outline-none focus:ring-2 focus:ring-[color:var(--sidebar-accent)]"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-transparent border border-[color:var(--border)] text-[color:var(--muted-foreground)]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleInviteMember}
                  disabled={isInviting}
                  className="px-4 py-2 rounded-xl bg-[color:var(--sidebar-accent)] text-[color:var(--sidebar-accent-foreground)] font-semibold disabled:opacity-50"
                >
                  {isInviting ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="bg-[color:var(--background)] border border-[color:var(--border)] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Workspace Members</h3>
        </div>

        <div className="flex flex-col gap-4">
          {members.map((member) => {
            const isOwner = workspace?.ownerId === member.id;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-2xl border  bg-[color:var(--card)] hover:border-[color:var(--accent)] transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${member.fullName}`}
                    alt={member.fullName}
                    className="w-12 h-12 rounded-2xl object-cover border border-[color:var(--border)]"
                  />

                  <div>
                    <h4 className="font-semibold text-[color:var(--foreground)]">
                      {member.fullName}
                    </h4>

                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--sidebar-accent)] text-[color:var(--sidebar-accent-foreground)] text-sm font-medium">
                    <Crown size={16} />
                    {isOwner ? "Owner" : "Member"}
                  </div>

                  {!isOwner && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMemberMenu(
                            activeMemberMenu === member.id ? null : member.id
                          )
                        }
                        className="p-2 rounded-full hover:bg-[color:var(--card)] text-red-500"
                        aria-label="Member actions"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMemberMenu === member.id && (
                        <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] shadow-lg z-10">
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={isRemoving}
                            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Deactivate account
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,

          style: {
            background: "#1e1e1e",
            color: "#fff",
            borderRadius: "12px",
            padding: "14px 16px",
            fontSize: "14px",
          },

          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },

          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
};

export default ManageMembers;
