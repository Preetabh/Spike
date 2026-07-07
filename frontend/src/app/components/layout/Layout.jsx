"use client";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { applyTheme } from "../../../lib/theme";
import { initSocket } from "../../../sockets/socket";
import CallModal from "../chat/CallModal";

import TopNavbar from "../navbar/TopNavbar";
import MobileNavbar from "../mobile/MobileNavbar";
import Sidebar from "../sidebarNav/sidebarNav";

export default function Layout({
  children,
  onOpenSettings,
}) {
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params?.id;
  const isChatOpen = Boolean(params?.memberId || params?.channelId || params?.groupId);

  const router = useRouter();
  const [activeCall, setActiveCall] = useState(null);

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

      // Join personal socket room for calls and alerts routing
      const socket = initSocket();
      if (socket) {
        console.log("🚀 Socket: Emitting joinUserRoom for user:", user.id);
        socket.emit("joinUserRoom", user.id);
      }
    }
  }, [user]);

  // Listen for global message alerts and unread updates
  useEffect(() => {
    if (!id) return;
    const socket = initSocket();
    if (!socket) return;

    const handleConnect = () => {
      if (user?.id) {
        console.log("🚀 Socket: Connected/reconnected. Joining user room:", user.id);
        socket.emit("joinUserRoom", user.id);
      }
    };

    socket.on("connect", handleConnect);

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
      socket.off("connect", handleConnect);
      socket.off("receive-message", handleReceiveMessageGlobal);
    };
  }, [id, queryClient]);

  // Listen for WebRTC incoming calls globally
  useEffect(() => {
    if (!id) return;
    const socket = initSocket();
    if (!socket) return;

    const handleIncomingCall = (data) => {
      console.log("📞 WebRTC [Global Layout]: IncomingCall event received via socket:", data);
      setActiveCall((prev) => {
        if (prev) return prev;
        return {
          id: data.callId,
          type: data.callType,
          role: "receiver",
          chat: {
            id: data.chatId,
            name: data.callerName || "Incoming Call",
          }
        };
      });
    };

    socket.on("incomingCall", handleIncomingCall);
    return () => {
      socket.off("incomingCall", handleIncomingCall);
    };
  }, [id]);

  // Listen for WebRTC start-call custom triggers from ChatContainer
  useEffect(() => {
    const handleStartCall = (event) => {
      const { callType, chatType, conversationId, selectedChatName, memberId, members } = event.detail;
      const callId = `call_${Date.now()}`;
      const socket = initSocket();
      
      let participants = [];
      if (chatType === "dm" && memberId) {
        participants = [memberId];
      } else if (members) {
        participants = members
          .map((m) => m.userId)
          .filter((uid) => uid && uid !== user?.id);
      }

      console.log("📞 WebRTC [Global Layout]: Emitting callUser event via socket:", {
        callId,
        participants,
        callType,
      });

      socket?.emit("callUser", {
        callId,
        participants,
        callType,
        callScope: chatType,
        chatId: conversationId || "no-id",
        callerName: user?.fullName || "Spike User",
      });

      setActiveCall({
        id: callId,
        type: callType,
        role: "caller",
        chat: {
          id: conversationId || "no-id",
          name: selectedChatName,
        }
      });
    };

    window.addEventListener("start-call-trigger", handleStartCall);
    return () => {
      window.removeEventListener("start-call-trigger", handleStartCall);
    };
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
        className={isChatOpen ? "hidden" : ""}
        onOpenSettings={onOpenSettings}
        isOwner={isOwner}
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
      {!isChatOpen && <MobileNavbar id={id} />}

      {activeCall && (
        <CallModal
          call={activeCall}
          currentUserId={user?.id}
          onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
