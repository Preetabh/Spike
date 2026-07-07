import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";

const ChatHeader = ({ chat, onToggleDrawer, onStartCall }) => {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.id;

  const handleBack = () => {
    if (chat?.type === "dm") {
      router.push(`/workspace/${workspaceId}/dm`);
    } else if (chat?.type === "channel") {
      router.push(`/workspace/${workspaceId}/channels`);
    } else if (chat?.type === "group") {
      router.push(`/workspace/${workspaceId}/groups`);
    } else {
      router.push(`/workspace/${workspaceId}`);
    }
  };

  const typeGradient = {
    dm: "from-purple-500/80 to-pink-500/80",
    group: "from-amber-400 to-orange-500",
    channel: "from-blue-500 to-purple-600",
  };

  const isChannel = chat?.type === "channel";
  const isGroup = chat?.type === "group";

  // Initials cleaning
  const nameInitials = chat?.name?.replace(/^[#\s👥\s]*/g, "") || "C";
  const avatarInitials = isChannel ? "#" : nameInitials.charAt(0);

  return (
    <div className="relative h-[72px] border-b border-border bg-card/65 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between transition-all duration-300 overflow-hidden shadow-sm">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-10 w-44 h-44 rounded-full bg-[color:var(--primary)]/5 blur-3xl"></div>
      </div>

      {/* Left section */}
      <div
        onClick={onToggleDrawer}
        className="relative z-10 flex items-center gap-2 md:gap-4 min-w-0 cursor-pointer hover:opacity-90 active:scale-[0.99] transition select-none group"
      >
        {/* Back button on mobile */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleBack();
          }}
          className="md:hidden p-2 mr-1 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground active:scale-95 transition"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 md:w-11 md:h-11 rounded-[16px] overflow-hidden flex items-center justify-center shadow-lg border border-white/10 transition-transform duration-300 group-hover:scale-105 select-none bg-zinc-950">
          {chat?.avatar ? (
            <img
              src={chat.avatar}
              alt="chat avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${typeGradient[chat?.type || "dm"]} text-white flex items-center justify-center font-extrabold text-sm md:text-base`}>
              {avatarInitials}
            </div>
          )}
        </div>

        {/* Chat Info */}
        <div className="min-w-0">
          <h2 className="text-foreground font-bold text-sm md:text-base truncate tracking-tight group-hover:text-[color:var(--primary)] transition">
            {chat?.name}
          </h2>

          <div className="flex items-center gap-1.5 mt-0.5">
            {chat?.type === "dm" && chat?.isOnline && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            )}
            <span className="text-[10px] md:text-xs text-muted-foreground font-medium tracking-wide">
              {(() => {
                if (isChannel) return chat?.isPrivate ? "Private Channel" : "Public Channel";
                if (isGroup) return "Group Conversation";
                if (chat?.isOnline) return "Online";
                if (chat?.lastSeen) {
                  const date = new Date(chat.lastSeen);
                  const now = new Date();
                  const diffMs = now - date;
                  const diffMins = Math.floor(diffMs / (1000 * 60));
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  
                  if (diffMins < 1) return "Last seen just now";
                  if (diffMins < 60) return `Last seen ${diffMins}m ago`;
                  if (diffHours < 24) return `Last seen ${diffHours}h ago`;
                  return `Last seen on ${date.toLocaleDateString([], { month: "short", day: "numeric" })}`;
                }
                return "Offline";
              })()}
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="relative z-10 flex items-center gap-2 md:gap-3">
        <button
          onClick={() => onStartCall?.("audio")}
          aria-label="call"
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl border border-border bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition duration-200 flex items-center justify-center shadow-lg active:scale-95 cursor-pointer"
        >
          <Phone size={15} />
        </button>

        <button
          onClick={() => onStartCall?.("video")}
          aria-label="video"
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl border border-border bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition duration-200 flex items-center justify-center shadow-lg active:scale-95 cursor-pointer"
        >
          <Video size={15} />
        </button>

        <button
          onClick={onToggleDrawer}
          aria-label="options"
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl border border-border bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition duration-200 flex items-center justify-center shadow-lg active:scale-95"
        >
          <MoreVertical size={15} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
