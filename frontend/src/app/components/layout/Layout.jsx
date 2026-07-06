"use client";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { applyTheme } from "../../../lib/theme";
import { initSocket } from "../../../sockets/socket";

import TopNavbar from "../navbar/TopNavbar";
import MobileNavbar from "../mobile/MobileNavbar";
import Sidebar from "../sidebarNav/sidebarNav";

export default function Layout({
  children,
  onOpenSettings,
}) {
  const queryClient = useQueryClient();
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
    if (user) {
      applyTheme(
        user.appearanceMode || user.appearance?.mode || "dark",
        user.theme || user.appearance?.theme || "rose"
      );
    }
  }, [user]);

  // Request Push Notification token on login/load
  useEffect(() => {
    if (user) {
      import("../../../lib/firebase").then(({ initPushNotifications }) => {
        initPushNotifications().catch((err) => {
          console.warn("FCM push registration skipped:", err);
        });
      });
    }
  }, [user]);

  // Listen for global message alerts and unread updates
  useEffect(() => {
    if (!id) return;
    const socket = initSocket();
    if (!socket) return;

    const handleReceiveMessageGlobal = (message) => {
      console.log("📨 Global Socket Message received:", message);
      
      // Invalidate the lists to refresh unread counts and last message previews instantly!
      queryClient.invalidateQueries(["dm", id]);
      queryClient.invalidateQueries(["channels", id]);
      queryClient.invalidateQueries(["groups", id]);
      
      // Also invalidate conversation details in case it's currently open
      queryClient.invalidateQueries(["conversation"]);

      // Check if current user is mentioned in message content
      const isMention = user?.fullName && (
        message.content?.toLowerCase().includes(`@${user.fullName.toLowerCase().replace(/\s+/g, "")}`) ||
        message.content?.toLowerCase().includes(`@${user.fullName.toLowerCase()}`)
      );

      // Push notification when browser window is in background or if user is mentioned
      if ((document.hidden || isMention) && message.senderId !== user?.id) {
        if (Notification.permission === "granted") {
          const title = isMention 
            ? `🚨 Mentioned by ${message.sender?.fullName || "User"}`
            : `New message from ${message.sender?.fullName || "User"}`;
            
          new Notification(title, {
            body: message.content,
            icon: message.sender?.avatar || "/favicon.ico",
          });
        }
      }
    };

    socket.on("receive-message", handleReceiveMessageGlobal);

    return () => {
      socket.off("receive-message", handleReceiveMessageGlobal);
    };
  }, [id, queryClient]);

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
      <div className="flex flex-1 min-h-0 overflow-hidden">
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
        <div className="flex-1 bg-[color:var(--background)] text-[color:var(--foreground)] overflow-hidden min-h-0 h-full flex flex-col">
          {children}
        </div>
      </div>

      {/* 🔥 MOBILE NAV */}
      <MobileNavbar id={id} />
    </div>
  );
}
