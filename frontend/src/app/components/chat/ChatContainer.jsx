"use client";

import React from "react";
import { useParams } from "next/navigation";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import EmptyState from "./EmptyState";

const dummyChats = [
  {
    id: 1,
    name: "General",
    type: "channel",
  },
  {
    id: 2,
    name: "Frontend Team",
    type: "group",
  },
  {
    id: 3,
    name: "Vishu",
    type: "dm",
  },
  {
    id: 4,
    name: "React Help",
    type: "channel",
  },
  {
    id: 5,
    name: "Design Team",
    type: "group",
  },
  {
    id: 6,
    name: "Rahul",
    type: "dm",
  },
];

const dummyMessages = [
  {
    id: 1,
    sender: "Vishu",
    text: "Hello everyone 👋",
    time: "10:30 AM",
    isOwn: false,
  },
  {
    id: 2,
    sender: "You",
    text: "Let's start today's work",
    time: "10:32 AM",
    isOwn: true,
  },
  {
    id: 3,
    sender: "Aman",
    text: "UI design completed 🚀",
    time: "10:35 AM",
    isOwn: false,
  },
];

const ChatContainer = () => {
  const params = useParams();

  // GET ACTIVE CHAT ID FROM URL
  const activeId =
    params?.memberId ||
    params?.channelId ||
    params?.groupId;

  // FIND CURRENT SELECTED CHAT
  const selectedChat = dummyChats.find(
    (chat) => String(chat.id) === String(activeId)
  );

  return (
    <div className="flex-1 h-screen flex flex-col bg-[color:var(--background)] text-[color:var(--foreground)] overflow-hidden">
      {/* BACKGROUND EFFECT */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-[color:var(--primary)]/10 blur-3xl"></div>

        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[color:var(--accent)]/10 blur-3xl"></div>
      </div>

      {selectedChat ? (
        <>
          {/* CHAT HEADER */}
          <div className="relative z-10 border-b border-[color:var(--border)] backdrop-blur-xl bg-[color:var(--card)]/70">
            <ChatHeader chat={selectedChat} />
          </div>

          {/* MESSAGE LIST */}
          <div className="flex-1 relative z-10 overflow-hidden">
            <MessageList messages={dummyMessages} />
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
