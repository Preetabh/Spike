

import React from "react";

const MessageInput = () => {
  return (
    <div className="w-full border-t border-[color:var(--border)] bg-[color:var(--background)]/80 px-4 md:px-6 py-5 backdrop-blur-xl transition-all duration-300">
      <div className="relative flex items-end gap-4 rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)]/80 px-4 md:px-5 py-4 shadow-lg backdrop-blur-xl transition-all duration-300 focus-within:border-[color:var(--primary)] overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <div className="absolute inset-0 bg-[color:var(--accent)]/5"></div>
        </div>

        {/* Left Actions */}
        <div className="relative z-10 flex items-center gap-2 pb-1">
          <button className="w-10 h-10 rounded-2xl flex items-center justify-center text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--accent)] transition-all duration-300 text-lg border border-transparent hover:border-[color:var(--border)]">
            ➕
          </button>

          <button className="w-10 h-10 rounded-2xl flex items-center justify-center text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--accent)] transition-all duration-300 text-lg border border-transparent hover:border-[color:var(--border)]">
            😊
          </button>
        </div>

        {/* Input */}
        <div className="relative z-10 flex-1">
          <textarea
            rows={1}
            placeholder="Message #general"
            className="w-full bg-transparent text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] resize-none outline-none text-[15px] leading-7 max-h-40 overflow-y-auto pr-2 no-scrollbar"
          />

          {/* Bottom Hint */}
          <div className="flex items-center justify-between mt-2 gap-4 flex-wrap">
            <p className="text-xs text-[color:var(--muted-foreground)]">
              Shift + Enter for new line
            </p>

            <p className="text-xs text-[color:var(--muted-foreground)]/80">
              Markdown supported
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="relative z-10 flex items-center gap-2 pb-1">
          <button className="w-10 h-10 rounded-2xl flex items-center justify-center text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--accent)] transition-all duration-300 text-lg border border-transparent hover:border-[color:var(--border)]">
            🎤
          </button>

          <button className="w-12 h-12 rounded-2xl bg-[color:var(--primary)] hover:bg-[color:var(--accent)] active:scale-95 transition-all duration-300 flex items-center justify-center text-[color:var(--primary-foreground)] text-xl shadow-lg border border-[color:var(--border)] backdrop-blur-xl">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
