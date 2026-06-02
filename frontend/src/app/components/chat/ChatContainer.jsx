"use client";

import React from "react";
import { useParams } from "next/navigation";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import EmptyState from "./EmptyState";

import { useQuery } from "@tanstack/react-query";



const ChatContainer = () => {
  const params = useParams();

  const memberId = params?.memberId;
  const workspaceId = params?.workspaceId;

  const { data, isLoading } = useQuery({
    queryKey: ["dm-conversation", memberId, workspaceId],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/dm/${memberId}?workspaceId=${workspaceId}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch DM conversation");
      }

      return res.json();
    },
    enabled: !!memberId && !!workspaceId,
  });

  // GET ACTIVE CHAT ID FROM URL
  const activeId =
    params?.memberId ||
    params?.channelId ||
    params?.groupId;

  const selectedChat = data?.user;
  const messages = data?.messages || [];

  if (memberId && isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex-1 h-screen flex flex-col bg-[color:var(--background)] text-[color:var(--foreground)] overflow-hidden">
      {/* BACKGROUND EFFECT */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-[color:var(--primary)]/10 blur-3xl"></div>

        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[color:var(--accent)]/10 blur-3xl"></div>
      </div>

      {(activeId && selectedChat) ? (
        <>
          {/* CHAT HEADER */}
          <div className="relative z-10 border-b border-[color:var(--border)] backdrop-blur-xl bg-[color:var(--card)]/70">
            <ChatHeader
              chat={{
                id: selectedChat.id,
                name: selectedChat.fullName,
                avatar: selectedChat.avatar,
                isOnline: selectedChat.isOnline,
                type: "dm",
              }}
            />
          </div>

          {/* MESSAGE LIST */}
          <div className="flex-1 relative z-10 overflow-hidden">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No conversation yet
              </div>
            ) : (
              <MessageList messages={messages} />
            )}
          </div>

          {/* MESSAGE INPUT */}
          <div className="relative z-10 border-t border-[color:var(--border)] backdrop-blur-xl bg-[color:var(--card)]/70">
            <MessageInput />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center relative z-10">
          <EmptyState />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
