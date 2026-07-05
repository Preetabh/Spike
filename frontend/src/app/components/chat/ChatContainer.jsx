"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import useConversationSocket from "../../../hooks/useConversationSocket";
import useMessages from "../../../hooks/useMessages";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import TypingIndicator from "./TypingIndicator";
import { getSocket } from "../../../sockets/socket";

const ChatContainer = () => {
  const params = useParams();
  const queryClient = useQueryClient();

  const workspaceId = params?.id;
  const memberId = params?.memberId;
  const channelId = params?.channelId;
  const groupId = params?.groupId;

  const chatType = channelId ? "channel" : groupId ? "group" : "dm";
  const [typingUsers, setTypingUsers] = useState([]);

  // Fetch current user
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/me`, {
        credentials: "include",
      });
      const data = await res.json();
      return data?.data;
    },
    staleTime: 1000 * 60 * 5,
  });
  const currentUserId = meData?.id;

  // Fetch active conversation metadata
  const { data, isLoading, isError } = useQuery({
    queryKey: ["conversation", chatType, memberId || channelId || groupId, workspaceId],
    queryFn: async () => {
      let url = "";
      if (chatType === "dm") {
        url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/dm/${memberId}?workspaceId=${workspaceId}`;
      } else if (chatType === "channel") {
        url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/channels/${channelId}`;
      } else if (chatType === "group") {
        url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/groups/${groupId}`;
      }

      const res = await fetch(url, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch ${chatType} conversation`);
      }

      return res.json();
    },
    enabled: Boolean(workspaceId && (memberId || channelId || groupId)),
    staleTime: 1000 * 60,
  });

  // Extract selectedChat info and conversationId
  let selectedChatName = "Select a conversation";
  let selectedChatAvatar = "";
  let selectedChatOnline = false;
  let conversationId = null;

  if (data) {
    if (chatType === "dm") {
      selectedChatName = data?.user?.fullName || data?.user?.name || "Direct Message";
      selectedChatAvatar = data?.user?.avatar || "";
      selectedChatOnline = data?.user?.isOnline || false;
      conversationId = data?.conversation?.id;
    } else if (chatType === "channel") {
      selectedChatName = `# ${data?.title || data?.name || "channel"}`;
      selectedChatAvatar = "";
      selectedChatOnline = false;
      conversationId = data?.id;
    } else if (chatType === "group") {
      selectedChatName = `👥 ${data?.title || data?.name || "group"}`;
      selectedChatAvatar = "";
      selectedChatOnline = false;
      conversationId = data?.id;
    }
  }

  useConversationSocket(conversationId);

  // Load message history & listen to realtime messages
  const { messages, isLoading: messagesLoading } = useMessages(conversationId);

  // Listen for realtime typing indicator events
  useEffect(() => {
    if (!conversationId) return;
    const socket = getSocket();
    if (!socket) return;

    const handleUserTyping = ({ conversationId: msgConvId, user }) => {
      if (msgConvId !== conversationId) return;
      setTypingUsers((prev) => {
        if (prev.some((u) => u.id === user.id)) return prev;
        return [...prev, user];
      });
    };

    const handleUserStopTyping = ({ conversationId: msgConvId, userId }) => {
      if (msgConvId !== conversationId) return;
      setTypingUsers((prev) => prev.filter((u) => u.id !== userId));
    };

    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);

    // Reset typing list on room switch
    setTypingUsers([]);

    return () => {
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
    };
  }, [conversationId]);

  // Listen for live online/offline updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleOnlineUsers = (onlineUserIds) => {
      console.log("🟢 Live Online Users Update:", onlineUserIds);
      // Invalidate queries to trigger instant list/header status refresh
      queryClient.invalidateQueries(["dm", workspaceId]);
      queryClient.invalidateQueries(["conversation", chatType, memberId || channelId || groupId, workspaceId]);
    };

    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("online-users", handleOnlineUsers);
    };
  }, [workspaceId, chatType, memberId, channelId, groupId, queryClient]);

  if ((memberId || channelId || groupId) && (isLoading || messagesLoading)) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[color:var(--background)]">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[color:var(--background)] text-red-500">
        Failed to load conversation.
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[color:var(--primary)]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[color:var(--accent)]/10 blur-3xl" />
      </div>

      <div className="relative z-10 shrink-0 border-b border-[color:var(--border)] bg-[color:var(--card)]/70 backdrop-blur-xl">
        <ChatHeader
          chat={{
            id: conversationId || "no-id",
            name: selectedChatName,
            avatar: selectedChatAvatar,
            isOnline: selectedChatOnline,
            type: chatType,
          }}
        />
      </div>

      <div
        className="relative z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-5 [scrollbar-width:none] [-ms-overflow-style:none]"
        style={{ scrollbarWidth: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <MessageList messages={messages} currentUserId={currentUserId} />
      </div>

      {/* Realtime Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="relative z-10 shrink-0">
          <TypingIndicator users={typingUsers.map((u) => u.fullName || u.name || "User")} />
        </div>
      )}

      <div className="relative z-10 shrink-0 border-t border-[color:var(--border)] bg-[color:var(--card)]/90 backdrop-blur-xl">
        <MessageInput
          conversationId={conversationId}
          workspaceId={workspaceId}
          memberId={memberId}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
