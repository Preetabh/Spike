"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const EditWorkspace = ({ workspace }) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || "");
      setDescription(workspace.description || "");
    }
  }, [workspace]);

  const { mutate: updateWorkspace, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspaces/${workspace.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update workspace");
      }

      return data;
    },

    onSuccess: () => {
      toast.success("Workspace updated successfully");

      queryClient.invalidateQueries({
        queryKey: ["workspace", workspace.id],
      });
    },

    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
  });

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={
              workspace.logo ||
              "https://ui-avatars.com/api/?name=" + workspace.name
            }
            alt="workspace"
            className="w-24 h-24 rounded-3xl object-cover border-4 border-[color:var(--border)] shadow-lg"
          />

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)]">
              {workspace.name}
            </h2>

            <p className="text-[color:var(--muted-foreground)] mt-1 max-w-xl">
              {workspace.description || "No description added yet."}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="px-4 py-1 rounded-full text-sm font-medium bg-[color:var(--sidebar-accent)] text-[color:var(--sidebar-accent-foreground)]">
                {workspace.plan?.toUpperCase()} Plan
              </span>

              <span className="px-4 py-1 rounded-full text-sm border border-[color:var(--border)] bg-[color:var(--card)]">
                👥 {workspace.members?.length || 0} Members
              </span>

              <span className="px-4 py-1 rounded-full text-sm border border-[color:var(--border)] bg-[color:var(--card)]">
                🚀 Created {new Date(workspace.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => updateWorkspace()}
          disabled={isPending}
          className="px-6 py-3 rounded-xl bg-[color:var(--sidebar-accent)] text-[color:var(--sidebar-accent-foreground)] font-semibold shadow-md hover:opacity-90 transition disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[color:var(--background)] border border-[color:var(--border)] rounded-3xl p-6 flex flex-col gap-5 shadow-sm">
          <div>
            <label className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Workspace Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 bg-[color:var(--card)] border border-[color:var(--border)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[color:var(--sidebar-accent)]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Workspace Description
            </label>

            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-2 bg-[color:var(--card)] border border-[color:var(--border)] rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-[color:var(--sidebar-accent)]"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-gradient-to-br from-[color:var(--sidebar-accent)] to-[color:var(--accent)] rounded-3xl p-6 shadow-md border border-[color:var(--border)]">
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Active Members
            </p>

            <h3 className="text-4xl font-bold mt-3">
              {workspace.members?.length || 0}
            </h3>
          </div>

          <div className="bg-[color:var(--background)] rounded-3xl p-6 shadow-sm border border-[color:var(--border)]">
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Current Plan
            </p>

            <h3 className="text-3xl font-bold mt-3">
              {workspace.plan?.toUpperCase()}
            </h3>
          </div>

          <div className="bg-[color:var(--background)] rounded-3xl p-6 shadow-sm border border-[color:var(--border)] sm:col-span-2">
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Workspace Avatar
            </p>

            <div className="flex items-center gap-4 mt-5">
              <img
                src={
                  workspace.logo ||
                  "https://ui-avatars.com/api/?name=" + workspace.name
                }
                alt="workspace"
                className="w-20 h-20 rounded-2xl object-cover border border-[color:var(--border)]"
              />

              <div className="flex gap-3">
                <button className="px-5 py-2 rounded-xl bg-[color:var(--sidebar-accent)] text-[color:var(--sidebar-accent-foreground)] font-medium hover:opacity-90 transition">
                  Upload New
                </button>

                <button className="px-5 py-2 rounded-xl border border-[color:var(--border)] text-[color:var(--foreground)] hover:bg-[color:var(--background)] transition">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditWorkspace;
