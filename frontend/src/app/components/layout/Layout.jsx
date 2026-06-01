"use client";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { applyTheme } from "../../../lib/theme";

import TopNavbar from "../navbar/TopNavbar";
import MobileNavbar from "../mobile/MobileNavbar";
import Sidebar from "../sidebarNav/sidebarNav";

export default function Layout({
  children,
  onOpenSettings,
}) {
  const { id } = useParams();

  const router = useRouter();

  // Protected fetch helper
  const fetchData = async (url) => {
    const res = await fetch(url, {
      credentials: "include",
    });

    // Unauthorized / forbidden
    if (
      res.status === 401 ||
      res.status === 403
    ) {
      router.push("/login");

      throw new Error(
        "Unauthorized access"
      );
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data?.message ||
          "Something went wrong"
      );
    }

    return data?.data || data;
  };

  // Workspace
  const { data: workspace } = useQuery({
    queryKey: ["workspace", id],

    queryFn: () =>
      fetchData(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspaces/${id}`
      ),
  });

  // Current user
  const { data: user } = useQuery({
    queryKey: ["me"],

    queryFn: () =>
      fetchData(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/me`
      ),
  });

  // Apply theme
  useEffect(() => {
    if (user?.appearance) {
      applyTheme(
        user.appearance.mode,
        user.appearance.theme
      );
    }
  }, [user]);

  // Owner check
  const isOwner =
    workspace?.ownerId === user?.id;

  return (
    <div className="flex flex-col h-screen">
      {/* 🔥 TOP NAVBAR */}
      <TopNavbar
        user={user}
        workspace={workspace}
      />

      {/* 🔥 MAIN AREA */}
      <div className="flex flex-1 overflow-hidden">
        {/* 🔥 SIDEBAR */}
        <Sidebar
          id={id}
          workspace={workspace}
          user={user}
          isOwner={isOwner}
          onOpenSettings={
            onOpenSettings
          }
        />

        {/* 🔥 CONTENT */}
        <div className="flex-1 p-4 bg-[color:var(--background)] text-[color:var(--foreground)] overflow-auto">
          {children}
        </div>
      </div>

      {/* 🔥 MOBILE NAV */}
      <MobileNavbar id={id} />
    </div>
  );
}
