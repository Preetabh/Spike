"use client";

import Link from "next/link";
import { useEffect } from "react";

import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import toast, { Toaster } from "react-hot-toast";

import WorkspaceSettings from "./workspaceSettings.jsx";
import EditWorkspace from "./editWorkspace.jsx";
import ManageMembers from "./manageMembers.jsx";

const SettingsPage = () => {
  const { id } = useParams();

  const router = useRouter();

  const searchParams = useSearchParams();

  const tab =
    searchParams.get("tab") || "workspace";

  // Fetch workspace
  const {
    data: workspace,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workspace", id],

    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspaces/${id}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch workspace"
        );
      }

      return response.json();
    },
  });

  // Owner check
  const isOwner =
    workspace?.admin === true;

  // Protect page
  useEffect(() => {
    if (isLoading) return;

    // Workspace invalid
    if (error || !workspace) {
      toast.error("Workspace not found");

      setTimeout(() => {
        router.push("/workspace");
      }, 1500);

      return;
    }

    // Unauthorized user
    if (!isOwner) {
      toast.error(
        "You are not authorized to access this page"
      );

      setTimeout(() => {
        router.push(`/workspace/${id}`);
      }, 1500);
    }
  }, [
    workspace,
    isLoading,
    error,
    isOwner,
    router,
    id,
  ]);

  // Smooth scroll to top on tab switch
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [tab]);

  // Loading UI
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading workspace settings...
      </div>
    );
  }

  // Unauthorized
  if (!isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] p-6">
      {/* Top Navbar */}
      <div className="flex gap-4 border-b border-[color:var(--border)] pb-4 mb-6 overflow-x-auto no-scrollbar">
        <Link
          href="?tab=workspace"
          className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
            tab === "workspace"
              ? "bg-[color:var(--sidebar-accent)] text-[color:var(--sidebar-accent-foreground)]"
              : "bg-[color:var(--card)] border border-[color:var(--border)] hover:bg-[color:var(--accent)]"
          }`}
        >
          Workspace Settings
        </Link>

        <Link
          href="?tab=edit"
          className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
            tab === "edit"
              ? "bg-[color:var(--sidebar-accent)] text-[color:var(--sidebar-accent-foreground)]"
              : "bg-[color:var(--card)] border border-[color:var(--border)] hover:bg-[color:var(--accent)]"
          }`}
        >
          Edit Workspace
        </Link>

        <Link
          href="?tab=members"
          className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
            tab === "members"
              ? "bg-[color:var(--sidebar-accent)] text-[color:var(--sidebar-accent-foreground)]"
              : "bg-[color:var(--card)] border border-[color:var(--border)] hover:bg-[color:var(--accent)]"
          }`}
        >
          Manage Members
        </Link>
      </div>

      {/* Dynamic Content */}
      <div className="bg-[color:var(--card)] border border-[color:var(--border)] rounded-2xl p-6 shadow-sm text-[color:var(--card-foreground)]">
        {tab === "workspace" && (
          <WorkspaceSettings />
        )}

        {tab === "edit" && (
          <EditWorkspace workspace={workspace} />
        )}

        {tab === "members" && (
          <ManageMembers workspace={workspace} />
        )}
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e1e1e",
            color: "#fff",
            borderRadius: "12px",
          },
        }}
      />
    </div>
  );
};

export default SettingsPage;
