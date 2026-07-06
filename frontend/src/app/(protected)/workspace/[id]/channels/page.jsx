"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import ChatList from "../../../../components/chatList/ChatList";
import ChatWelcome from "../../../../components/chat/ChatWelcome";
import SearchBar from "../../../../components/common/SearchBar";
import CreateChannelModal from "../../../../components/models/CreateChannelModal";

const Channel = () => {
  const params = useParams();
  const workspaceId = params?.id;
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="flex h-full overflow-hidden bg-[color:var(--background)] text-[color:var(--foreground)] transition-all duration-300">
      {/* LEFT SIDEBAR */}
      <div className="relative w-full md:w-[390px] border-r border-[color:var(--border)] bg-[color:var(--sidebar)] text-[color:var(--sidebar-foreground)] flex flex-col overflow-hidden backdrop-blur-xl transition-all duration-300">
        {/* TOP GLOW */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-52 bg-gradient-to-b from-[color:var(--primary)]/10 to-transparent"></div>

          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[color:var(--accent)]/10 blur-3xl"></div>
        </div>

        {/* HEADER */}
        <div className="relative z-10 p-6 border-b border-[color:var(--border)] bg-[color:var(--card)]/70 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)]">
                Channels
              </h1>


            </div>

            {/* CREATE CHANNEL */}
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="w-12 h-12 rounded-2xl bg-[color:var(--primary)] hover:bg-[color:var(--accent)] transition-all duration-300 flex items-center justify-center text-2xl font-medium text-[color:var(--primary-foreground)] shadow-lg active:scale-95 border border-[color:var(--border)] backdrop-blur-xl"
            >
              +
            </button>
          </div>

          {/* SEARCH */}
          <SearchBar placeholder="Search channels..." />
        </div>

        {/* FILTERS */}
        <div className="relative z-10 px-4 py-4 border-b border-[color:var(--border)] flex items-center gap-3 bg-[color:var(--card)]/40 overflow-x-auto no-scrollbar backdrop-blur-xl">
          <button className="px-4 py-2 rounded-2xl bg-[color:var(--primary)] text-[color:var(--primary-foreground)] text-sm font-medium shadow-lg whitespace-nowrap transition-all duration-300 border border-[color:var(--border)]">
            All Channels
          </button>

        </div>

        {/* CHANNEL LIST */}
        <div className="relative z-10 flex-1 overflow-hidden bg-[color:var(--sidebar)]">
          <ChatList routeType="channels" />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="relative hidden md:flex flex-1 flex-col bg-[color:var(--background)] overflow-hidden transition-all duration-300">
        {/* DECORATIVE GLOW */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-[color:var(--primary)]/5 blur-3xl pointer-events-none"></div>

        <div className="absolute bottom-0 left-20 w-[320px] h-[320px] rounded-full bg-[color:var(--accent)]/5 blur-3xl pointer-events-none"></div>

        {/* WELCOME SCREEN */}
        <div className="relative z-10 flex-1 flex flex-col">
          <ChatWelcome />
        </div>
      </div>

      <CreateChannelModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export default Channel;
