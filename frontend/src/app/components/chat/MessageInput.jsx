import { useRef, useState } from "react";
import { getSocket } from "../../../sockets/socket.js";

const MessageInput = ({ conversationId }) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

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

    setValue("");
    textareaRef.current?.focus();
  };

  console.log("Active Conversation:", conversationId);

  return (
    <div className="w-full border-t border-[color:var(--border)] bg-[color:var(--background)]/80 px-3 py-2 backdrop-blur-sm transition-all duration-200">
      <div className="relative flex items-end gap-3 rounded-full border border-[color:var(--border)] bg-[color:var(--card)]/75 px-3 py-2 shadow-sm backdrop-blur-md transition-all duration-200 focus-within:border-[color:var(--primary)]">
        {/* subtle background glow */}
        <div className="absolute inset-0 pointer-events-none opacity-60 rounded-full">
          <div className="absolute inset-0 bg-[color:var(--accent)]/4 rounded-full"></div>
        </div>

        {/* Left tiny actions */}
        <div className="relative z-10 flex items-center gap-2 pb-1">
          <button
            aria-label="add"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--accent)] transition-colors duration-150 text-sm border border-transparent hover:border-[color:var(--border)]"
          >
            ➕
          </button>

          <button
            aria-label="emoji"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--accent)] transition-colors duration-150 text-sm border border-transparent hover:border-[color:var(--border)]"
          >
            😊
          </button>
        </div>

        {/* Input */}
        <div className="relative z-10 flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message"
            className="w-full bg-transparent text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] resize-none outline-none text-sm leading-6 max-h-32 overflow-y-auto pr-2 no-scrollbar"
            aria-label="Message input"
          />

          {/* Bottom tiny hint */}
          <div className="flex items-center justify-between mt-1 gap-3 flex-wrap">
            <p className="text-xs text-[color:var(--muted-foreground)]">
              Shift + Enter for newline
            </p>

            <p className="text-xs text-[color:var(--muted-foreground)]/80">
              Markdown
            </p>
          </div>
        </div>

        {/* Right tiny actions */}
        <div className="relative z-10 flex items-center gap-2 pb-1">
          <button
            aria-label="voice"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--accent)] transition-colors duration-150 text-sm border border-transparent hover:border-[color:var(--border)]"
          >
            🎤
          </button>

          {/* Unique small gradient send button */}
          <button
            onClick={handleSend}
            aria-label="send"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[color:var(--primary-foreground)] text-sm shadow-sm border border-[color:var(--border)] bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] hover:opacity-95 active:scale-95 transition transform duration-150"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
