

import React from "react";

const ChatHeader = ({ chat }) => {
  return (
    <div className="relative h-[74px] border-b border-[color:var(--border)] bg-[color:var(--card)]/80 backdrop-blur-xl px-6 flex items-center justify-between transition-all duration-300 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-10 w-40 h-40 rounded-full bg-[color:var(--primary)]/10 blur-3xl"></div>
      </div>

      {/* Left */}
      <div className="relative z-10 flex items-center gap-4 min-w-0">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-2xl bg-[color:var(--primary)] text-[color:var(--primary-foreground)] flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300">
          {chat?.name?.charAt(0)}
        </div>

        {/* Chat Info */}
        <div className="min-w-0">
          <h2 className="text-[color:var(--foreground)] font-semibold text-lg truncate tracking-tight">
            {chat?.type === "channel"
              ? `# ${chat?.name}`
              : chat?.name}
          </h2>

          <p className="text-sm text-[color:var(--muted-foreground)] mt-0.5 truncate">
            {chat?.type === "channel"
              ? "Public Channel"
              : chat?.type === "group"
              ? "Group Conversation"
              : "Online"}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="relative z-10 flex items-center gap-3">
        <button className="w-10 h-10 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]/60 hover:bg-[color:var(--accent)] text-[color:var(--foreground)] backdrop-blur-xl transition-all duration-300 flex items-center justify-center shadow-lg">
          📞
        </button>

        <button className="w-10 h-10 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]/60 hover:bg-[color:var(--accent)] text-[color:var(--foreground)] backdrop-blur-xl transition-all duration-300 flex items-center justify-center shadow-lg">
          🎥
        </button>

        <button className="w-10 h-10 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]/60 hover:bg-[color:var(--accent)] text-[color:var(--foreground)] backdrop-blur-xl transition-all duration-300 flex items-center justify-center shadow-lg">
          ⋮
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
