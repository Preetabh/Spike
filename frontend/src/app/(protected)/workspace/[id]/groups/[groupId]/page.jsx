import React from "react";
import ChatList from "../../../../../components/chatList/ChatList";
import ChatContainer from "../../../../../components/chat/ChatContainer";
import SearchBar from "../../../../../components/common/SearchBar";

const GroupPage = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[color:var(--background)] text-[color:var(--foreground)] transition-all duration-300">
      {/* LEFT SIDEBAR */}
      <div className="relative w-[390px] border-r border-[color:var(--border)] bg-[color:var(--sidebar)] text-[color:var(--sidebar-foreground)] flex flex-col overflow-hidden backdrop-blur-xl transition-all duration-300">
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
                Groups
              </h1>

              <p className="text-sm text-[color:var(--muted-foreground)] mt-1 leading-6 max-w-[250px]">
                Collaborate privately with your project teams, members, and
                workspace groups.
              </p>
            </div>

            {/* CREATE GROUP */}
            <button className="w-12 h-12 rounded-2xl bg-[color:var(--primary)] hover:bg-[color:var(--accent)] text-[color:var(--primary-foreground)] transition-all duration-300 flex items-center justify-center text-2xl font-medium shadow-lg active:scale-95 border border-[color:var(--border)] backdrop-blur-xl">
              +
            </button>
          </div>

          {/* SEARCH */}
          <SearchBar placeholder="Search groups..." />
        </div>

        {/* FILTERS */}
        <div className="relative z-10 px-4 py-4 border-b border-[color:var(--border)] flex items-center gap-3 bg-[color:var(--card)]/40 overflow-x-auto no-scrollbar backdrop-blur-xl">
          <button className="px-4 py-2 rounded-2xl bg-[color:var(--primary)] text-[color:var(--primary-foreground)] text-sm font-medium shadow-lg whitespace-nowrap transition-all duration-300 border border-[color:var(--border)]">
            All Groups
          </button>

          <button className="px-4 py-2 rounded-2xl bg-[color:var(--card)] hover:bg-[color:var(--accent)] transition-all duration-300 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] whitespace-nowrap border border-[color:var(--border)] backdrop-blur-xl">
            Unread
          </button>

          <button className="px-4 py-2 rounded-2xl bg-[color:var(--card)] hover:bg-[color:var(--accent)] transition-all duration-300 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] whitespace-nowrap border border-[color:var(--border)] backdrop-blur-xl">
            Active
          </button>
        </div>

        {/* GROUP LIST */}
        <div className="relative z-10 flex-1 overflow-hidden bg-[color:var(--sidebar)]">
          <ChatList routeType="groups" />
        </div>
      </div>

      {/* RIGHT CHAT SECTION */}
      <div className="relative flex-1 flex flex-col bg-[color:var(--background)] overflow-hidden transition-all duration-300">
        {/* TOP RIGHT GLOW */}
        <div className="absolute top-10 right-10 w-[400px] h-[400px] rounded-full bg-[color:var(--primary)]/5 blur-3xl pointer-events-none"></div>

        {/* BOTTOM LEFT GLOW */}
        <div className="absolute bottom-0 left-20 w-[300px] h-[300px] rounded-full bg-[color:var(--accent)]/5 blur-3xl pointer-events-none"></div>

        {/* CHAT CONTAINER */}
        <div className="relative z-10 flex-1 flex flex-col">
          <ChatContainer />
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
