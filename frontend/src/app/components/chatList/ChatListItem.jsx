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
      className={`group relative flex items-center gap-4 mx-3 my-2 px-4 py-3.5 cursor-pointer rounded-2xl border transition-all duration-300 backdrop-blur-md overflow-hidden animate-list-appear hover:scale-[1.01] hover:-translate-y-[1px] active:scale-[0.99] ${
        active
          ? "bg-gradient-to-r from-[color:var(--primary)]/15 to-[color:var(--accent)]/5 border-[color:var(--primary)]/30 shadow-md shadow-[color:var(--primary)]/5"
          : "bg-transparent border-transparent hover:bg-[color:var(--accent)]/30 hover:border-white/5"
      }`}
    >
      {/* Background Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-r from-[color:var(--primary)]/5 to-transparent pointer-events-none"></div>

      {/* Active Indicator bar */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-1 rounded-full transition-all duration-300 ${
          active
            ? "bg-[color:var(--primary)] scale-y-100"
            : "bg-transparent scale-y-0 group-hover:scale-y-75 group-hover:bg-neutral-600"
        }`}
      ></div>

      {/* Avatar */}
      <Avatar
        name={chat?.name}
        src={chat?.avatar}
        type={chat?.type}
        status={chat?.isOnline || chat?.type === "dm" && chat?.isOnline}
        size="md"
      />

      {/* Chat Content */}
      <div className="flex-1 min-w-0 relative z-10">
        {/* Top Section */}
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <h2
              className={`truncate text-sm font-semibold tracking-tight transition-all duration-200 ${
                active
                  ? "text-white"
                  : "text-[color:var(--sidebar-foreground)] group-hover:text-white"
              }`}
            >
              {chat?.type === "channel"
                ? `# ${chat?.name?.replace(/^[#\s]*/g, "")}`
                : chat?.name}
            </h2>

            {/* Active Indicator dot */}
            {chat?.type === "dm" && chat?.isOnline && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            )}
          </div>

          <span
            className={`text-[10px] tracking-wide transition-all duration-200 ${
              active
                ? "text-[color:var(--primary)] font-semibold"
                : "text-[color:var(--muted-foreground)]"
            }`}
          >
            {chat?.time || "Now"}
          </span>
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[color:var(--muted-foreground)] group-hover:text-neutral-300 transition-colors truncate">
            {chat?.message || "No messages yet"}
          </p>

          {/* Unread Badge */}
          {chat?.unread > 0 && (
            <div className="min-w-5 h-5 px-1.5 rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] flex items-center justify-center text-[10px] text-[color:var(--primary-foreground)] font-bold shadow-md shadow-[color:var(--primary)]/20 transition-all duration-300">
              {chat?.unread}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
