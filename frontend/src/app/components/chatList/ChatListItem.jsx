import React from "react";
import Avatar from "../common/Avtar";

const ChatListItem = ({
  chat,
  active = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-4 px-5 py-4 cursor-pointer transition-all duration-300 border-b border-[color:var(--border)] overflow-hidden backdrop-blur-xl ${
        active
          ? "bg-[color:var(--card)] border-l-4 border-l-[color:var(--primary)] shadow-lg"
          : "hover:bg-[color:var(--accent)]"
      }`}
    >
      {/* Background Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-r from-[color:var(--accent)]/20 to-transparent pointer-events-none"></div>

      {/* Avatar */}
      <Avatar
        name={chat?.name}
        type={chat?.type}
        status={chat?.type === "dm"}
        size="md"
      />

      {/* Chat Content */}
      <div className="flex-1 min-w-0 relative z-10">
        {/* Top Section */}
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <h2
              className={`truncate text-[15px] font-semibold tracking-tight transition-all duration-200 ${
                active
                  ? "text-[color:var(--foreground)]"
                  : "text-[color:var(--sidebar-foreground)]"
              }`}
            >
              {chat?.type === "channel"
                ? `# ${chat?.name}`
                : chat?.name}
            </h2>

            {/* Active Badge */}
            {chat?.type === "dm" && (
              <span className="w-2 h-2 rounded-full bg-[color:var(--primary)] shadow-lg"></span>
            )}
          </div>

          <span
            className={`text-[11px] whitespace-nowrap transition-all duration-200 ${
              active
                ? "text-[color:var(--primary)]"
                : "text-[color:var(--muted-foreground)]"
            }`}
          >
            {chat?.time || "Now"}
          </span>
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[color:var(--muted-foreground)] truncate leading-6">
            {chat?.message}
          </p>

          {/* Unread Badge */}
          {chat?.unread > 0 && (
            <div className="min-w-6 h-6 px-1.5 rounded-full bg-[color:var(--primary)] flex items-center justify-center text-[11px] text-[color:var(--primary-foreground)] font-bold shadow-lg transition-all duration-300">
              {chat?.unread}
            </div>
          )}
        </div>
      </div>

      {/* Active Glow Border */}
      {active && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-[color:var(--border)] shadow-lg"></div>
      )}
    </div>
  );
};

export default ChatListItem;
