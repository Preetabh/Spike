import { useRef, useState } from "react";
import { getSocket } from "../../../sockets/socket.js";

const MessageInput = ({ conversationId }) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleInputChange = (e) => {
    setValue(e.target.value);

    if (!conversationId) return;
    const socket = getSocket();
    if (!socket) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing-start", { conversationId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("typing-stop", { conversationId });
    }, 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = value.trim();

    if (!trimmed) return;
    if (!conversationId) return;

    const socket = getSocket();

    socket?.emit("send-message", {
      conversationId,
      content: trimmed,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
    socket?.emit("typing-stop", { conversationId });

    setValue("");
    textareaRef.current?.focus();
  };

  return (
    <div className="w-full border-t border-white/5 bg-[#09090b]/80 px-4 py-3 pb-[72px] md:pb-4 backdrop-blur-xl transition-all duration-200">
      <div className="relative flex items-end gap-3 rounded-2xl border border-white/5 bg-neutral-900/40 hover:border-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 focus-within:border-[color:var(--primary)]/50 focus-within:ring-1 focus-within:ring-[color:var(--primary)]/30">
        {/* subtle background glow */}
        <div className="absolute inset-0 pointer-events-none opacity-40 rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--primary)]/5 to-[color:var(--accent)]/5 rounded-2xl"></div>
        </div>

        {/* Left Actions */}
        <div className="relative z-10 flex items-center gap-2 pb-0.5">
          <button
            aria-label="add"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition duration-200 text-sm active:scale-90"
          >
            ➕
          </button>

          <button
            aria-label="emoji"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition duration-200 text-sm active:scale-90"
          >
            😊
          </button>
        </div>

        {/* Input */}
        <div className="relative z-10 flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message..."
            className="w-full bg-transparent text-neutral-100 placeholder:text-neutral-500 resize-none outline-none text-[14px] sm:text-[15px] leading-6 max-h-32 overflow-y-auto pr-2 no-scrollbar"
            aria-label="Message input"
          />

          {/* Bottom hint info */}
          <div className="flex items-center justify-between mt-1.5 gap-3 flex-wrap">
            <p className="text-[10px] text-neutral-500 font-medium">
              Shift + Enter for newline
            </p>
            <p className="text-[10px] text-neutral-500/80 font-medium">
              Markdown supported
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="relative z-10 flex items-center gap-2 pb-0.5">
          <button
            aria-label="voice"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition duration-200 text-sm active:scale-90"
          >
            🎤
          </button>

          {/* Glowing gradients send icon button */}
          <button
            onClick={handleSend}
            aria-label="send"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm shadow-md bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] hover:shadow-[color:var(--primary)]/20 active:scale-95 transition transform duration-200"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
