
import React from "react";

const MessageBubble = ({ message }) => {
  return (
    <div
      className={`flex ${
        message?.isOwn ? "justify-end" : "justify-start"
      } mb-5 px-2 transition-all duration-300`}
    >
      <div
        className={`relative max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-3xl shadow-lg backdrop-blur-xl border transition-all duration-300 overflow-hidden ${
          message?.isOwn
            ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] border-[color:var(--primary)] rounded-br-md"
            : "bg-[color:var(--card)] text-[color:var(--foreground)] border-[color:var(--border)] rounded-bl-md"
        }`}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div
            className={`absolute inset-0 ${
              message?.isOwn
                ? "bg-[color:var(--primary)]/10"
                : "bg-[color:var(--accent)]/5"
            }`}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Sender */}
          {!message?.isOwn && (
            <p className="text-sm font-semibold text-[color:var(--primary)] mb-1 tracking-wide">
              {message?.sender}
            </p>
          )}

          {/* Message */}
          <p className="text-[15px] leading-7 break-words text-[color:inherit]">
            {message?.text}
          </p>

          {/* Time */}
          <div className="flex justify-end mt-3">
            <span
              className={`text-xs transition-all duration-300 ${
                message?.isOwn
                  ? "text-[color:var(--primary-foreground)]/70"
                  : "text-[color:var(--muted-foreground)]"
              }`}
            >
              {message?.time}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
