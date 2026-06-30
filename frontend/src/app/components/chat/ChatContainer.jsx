"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import useConversationSocket from "../../../hooks/useConversationSocket";
import useMessages from "../../../hooks/useMessages";

const ChatContainer = () => {
  const params = useParams();

  const memberId = params?.memberId;
  const workspaceId = params?.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dm-conversation", memberId, workspaceId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/dm/${memberId}?workspaceId=${workspaceId}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch DM conversation");
      }

      return res.json();
    },
    enabled: Boolean(memberId && workspaceId),
    staleTime: 1000 * 60,
  });

  const selectedChat = data?.user;
  const conversationId = data?.conversation?.id;

  useConversationSocket(conversationId);

  const {
    messages,
    isLoading: messagesLoading,
  } = useMessages(conversationId);

  if (memberId && (isLoading || messagesLoading)) {
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

  console.log('DM Chat Context', {
    conversationId,
    workspaceId,
    memberId,
  });
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[color:var(--primary)]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[color:var(--accent)]/10 blur-3xl" />
      </div>

      <div className="relative z-10 shrink-0 border-b border-[color:var(--border)] bg-[color:var(--card)]/70 backdrop-blur-xl">
        <ChatHeader
          chat={{
            id: selectedChat?.id || conversationId || "no-id",
            name:
              selectedChat?.fullName ||
              selectedChat?.name ||
              "Select a conversation",
            avatar: selectedChat?.avatar || "",
            isOnline: selectedChat?.isOnline || false,
            type: "dm",
          }}
        />
      </div>

      <div
        className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden min-h-0 [scrollbar-width:none] [-ms-overflow-style:none]"
        style={{ scrollbarWidth: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {messages.length === 0 ? (
          <div className="flex h-full min-h-[300px] items-center justify-center px-4 text-center text-muted-foreground">
            No conversation yet
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      <div className="relative z-10 shrink-0 border-t border-[color:var(--border)] bg-[color:var(--card)]/70 backdrop-blur-xl">
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
