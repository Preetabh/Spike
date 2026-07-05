import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";

const ChatHeader = ({ chat }) => {
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
    <div className="relative h-[72px] border-b border-white/5 bg-[#09090b]/60 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between transition-all duration-300 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-10 w-44 h-44 rounded-full bg-[color:var(--primary)]/5 blur-3xl"></div>
      </div>

      {/* Left section */}
      <div className="relative z-10 flex items-center gap-2 md:gap-4 min-w-0">
        {/* Back button on mobile */}
        <button
          onClick={handleBack}
          className="md:hidden p-2 mr-1 rounded-xl border border-white/10 bg-neutral-900/60 hover:bg-neutral-800 text-white active:scale-95 transition"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Avatar */}
        <div className={`w-10 h-10 md:w-11 md:h-11 rounded-[16px] bg-gradient-to-br ${typeGradient[chat?.type || "dm"]} text-white flex items-center justify-center font-extrabold text-sm md:text-base shadow-lg border border-white/10 transition-transform duration-300 hover:scale-105 select-none`}>
          {avatarInitials}
        </div>

        {/* Chat Info */}
        <div className="min-w-0">
          <h2 className="text-white font-bold text-sm md:text-base truncate tracking-tight">
            {chat?.name}
          </h2>

          <div className="flex items-center gap-1.5 mt-0.5">
            {chat?.type === "dm" && chat?.isOnline && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            )}
            <span className="text-[10px] md:text-xs text-neutral-400 font-medium tracking-wide">
              {isChannel
                ? "Public Channel"
                : isGroup
                ? "Group Conversation"
                : chat?.isOnline
                ? "Online"
                : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="relative z-10 flex items-center gap-2 md:gap-3">
        <button
          aria-label="call"
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl border border-white/5 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 hover:text-white transition duration-200 flex items-center justify-center shadow-lg active:scale-95"
        >
          <Phone size={15} />
        </button>

        <button
          aria-label="video"
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl border border-white/5 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 hover:text-white transition duration-200 flex items-center justify-center shadow-lg active:scale-95"
        >
          <Video size={15} />
        </button>

        <button
          aria-label="options"
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl border border-white/5 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 hover:text-white transition duration-200 flex items-center justify-center shadow-lg active:scale-95"
        >
          <MoreVertical size={15} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
