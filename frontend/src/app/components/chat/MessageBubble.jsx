import React from "react";

const MessageBubble = ({ message, currentUserId }) => {
  const isOwn = message.senderId === currentUserId || message.isOwn;

  const senderName = message?.sender?.fullName || message?.sender?.name || "User";
  const messageText = message?.content || message?.text || "";

  const timeString = message?.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : message?.time || "";

  return (
    <div
      className={`flex ${
        isOwn ? "justify-end" : "justify-start"
      } mb-4 px-3 sm:px-6 animate-message-appear transition-all duration-300`}
    >
      <div
        className={`relative w-fit max-w-[85%] sm:max-w-[75%] md:max-w-[65%] px-3 py-2.5 rounded-[18px] shadow-xl border transition-all duration-300 ${
          isOwn
            ? "bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] text-white border-transparent rounded-br-sm shadow-[color:var(--primary)]/10"
            : "bg-neutral-900/50 backdrop-blur-md text-neutral-100 border-white/5 rounded-bl-sm"
        }`}
      >
        {/* Glow Shading */}
        <div className="absolute inset-0 pointer-events-none opacity-40 rounded-[22px] overflow-hidden">
          <div
            className={`absolute inset-0 ${
              isOwn
                ? "bg-gradient-to-t from-white/10 to-transparent"
                : "bg-gradient-to-t from-white/5 to-transparent"
            }`}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col">
          {/* Sender */}
          {!isOwn && (
            <span className="text-[11px] font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1 tracking-wide">
              {senderName}
            </span>
          )}

          {/* Message Text */}
          <p className="text-[13px] sm:text-[14px] leading-relaxed break-words break-all whitespace-pre-wrap overflow-hidden text-neutral-100/95">
            {messageText}
          </p>

          {/* Time stamp */}
          <div className="flex justify-end mt-2">
            <span
              className={`text-[9px] tracking-wider transition-all duration-300 ${
                isOwn
                  ? "text-white/60"
                  : "text-neutral-500"
              }`}
            >
              {timeString}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
