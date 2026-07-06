"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { X, Mail, Clock, Info, Shield } from "lucide-react";

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
  const [showDrawer, setShowDrawer] = useState(false);
  const [prevConversationId, setPrevConversationId] = useState(null);

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
  let selectedChatLastSeen = null;
  let selectedChatIsPrivate = false;
  let conversationId = null;

  if (data) {
    if (chatType === "dm") {
      selectedChatName = data?.user?.fullName || data?.user?.name || "Direct Message";
      selectedChatAvatar = data?.user?.avatar || "";
      selectedChatOnline = data?.user?.isOnline || false;
      selectedChatLastSeen = data?.user?.lastSeen || null;
      conversationId = data?.conversation?.id;
    } else if (chatType === "channel") {
      selectedChatName = `# ${data?.title || data?.name || "channel"}`;
      selectedChatAvatar = "";
      selectedChatOnline = false;
      selectedChatIsPrivate = data?.type === "private_channel";
      conversationId = data?.id;
    } else if (chatType === "group") {
      selectedChatName = `👥 ${data?.title || data?.name || "group"}`;
      selectedChatAvatar = "";
      selectedChatOnline = false;
      conversationId = data?.id;
    }
  }

  useEffect(() => {
    if (conversationId !== prevConversationId) {
      setPrevConversationId(conversationId);
      setTypingUsers([]);
    }
  }, [conversationId, prevConversationId]);

  useConversationSocket(conversationId);

  // Load message history & listen to realtime messages (with pagination)
  const { messages, isLoading: messagesLoading, loadMore, hasMore } = useMessages(conversationId);

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

  const isInitialLoad = isLoading && !data;
  const isInitialMessagesLoad = messagesLoading && messages.length === 0;

  if ((memberId || channelId || groupId) && (isInitialLoad || isInitialMessagesLoad)) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[color:var(--background)] text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[color:var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold tracking-wider">Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[color:var(--background)] text-red-500">
        Failed to load conversation.
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden bg-[color:var(--background)]">
      {/* Main Chat Area */}
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden text-[color:var(--foreground)] border-r border-white/5 flex-1 transition-all duration-300">
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
              lastSeen: selectedChatLastSeen,
              isPrivate: selectedChatIsPrivate,
              type: chatType,
            }}
            onToggleDrawer={() => setShowDrawer((prev) => !prev)}
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

          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            loadMore={loadMore}
            hasMore={hasMore}
          />
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

      {/* Slide-over User Details/Chat Info Drawer */}
      <div
        className={`h-full border-l border-white/5 bg-neutral-950/95 backdrop-blur-xl transition-all duration-300 overflow-y-auto z-30 flex flex-col shrink-0 relative ${
          showDrawer ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden border-transparent"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Info size={14} className="text-purple-400" />
            Details
          </h3>
          <button
            onClick={() => setShowDrawer(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition active:scale-95 cursor-pointer"
            aria-label="Close details"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Content */}
        {showDrawer && (
          <div className="p-6 flex flex-col gap-6 text-center">
            {/* Avatar section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className={`w-24 h-24 rounded-[32px] bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-extrabold text-3xl shadow-2xl border border-white/10 select-none`}>
                  {selectedChatAvatar ? (
                    <img src={selectedChatAvatar} alt={selectedChatName} className="w-full h-full object-cover rounded-[32px]" />
                  ) : (
                    selectedChatName?.replace(/^[#\s👥\s]*/g, "").charAt(0) || "U"
                  )}
                </div>
                {chatType === "dm" && (
                  <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-neutral-950 ${selectedChatOnline ? "bg-green-400 animate-pulse" : "bg-neutral-600"}`} />
                )}
              </div>
              <h2 className="text-lg font-bold text-white mt-1 tracking-tight truncate max-w-full">
                {selectedChatName}
              </h2>
              {chatType === "dm" && (
                <span className="text-xs text-purple-400 font-semibold tracking-wider uppercase">
                  {selectedChatOnline ? "Active now" : "Offline"}
                </span>
              )}
            </div>

            <div className="h-[1px] bg-white/5"></div>

            {/* Info Items */}
            <div className="flex flex-col gap-4 text-left">
              {chatType === "dm" && data?.user && (
                <>
                  {/* Email */}
                  <div className="flex items-start gap-3.5 bg-neutral-900/30 p-3 rounded-xl border border-white/5">
                    <Mail size={16} className="text-neutral-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Email Address</p>
                      <p className="text-xs text-neutral-200 mt-0.5 break-all select-all font-medium">{data.user.email}</p>
                    </div>
                  </div>

                  {/* Last Seen */}
                  <div className="flex items-start gap-3.5 bg-neutral-900/30 p-3 rounded-xl border border-white/5">
                    <Clock size={16} className="text-neutral-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Last Activity</p>
                      <p className="text-xs text-neutral-200 mt-0.5 font-medium">
                        {data.user.isOnline ? "Online Now" : data.user.lastSeen ? new Date(data.user.lastSeen).toLocaleString() : "Offline"}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {chatType === "channel" && (
                <>
                  {/* Channel Description */}
                  <div className="flex flex-col gap-1.5 bg-neutral-900/30 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Description</p>
                    <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                      {data?.description || "No description provided for this channel."}
                    </p>
                  </div>

                  {/* Topic */}
                  {data?.topic && (
                    <div className="flex flex-col gap-1.5 bg-neutral-900/30 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Topic</p>
                      <p className="text-xs text-neutral-200 font-medium">{data.topic}</p>
                    </div>
                  )}

                  {/* Channel Type */}
                  <div className="flex items-center gap-3 bg-neutral-900/30 p-3 rounded-xl border border-white/5">
                    <Shield size={16} className="text-neutral-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Visibility</p>
                      <p className="text-xs text-neutral-200 mt-0.5 font-medium">
                        {data?.type === "private_channel" ? "Private Channel" : "Public Channel"}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {chatType === "group" && (
                <>
                  {/* Group description */}
                  <div className="flex flex-col gap-1.5 bg-neutral-900/30 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Description</p>
                    <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                      {data?.description || "Group conversation room."}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
