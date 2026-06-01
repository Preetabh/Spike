

import React from "react";

const ChatWelcome = () => {
  return (
    <div className="relative flex-1 flex items-center justify-center px-6 overflow-hidden bg-[color:var(--background)] text-[color:var(--foreground)]">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-[color:var(--primary)]/10 blur-3xl"></div>

        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[color:var(--accent)]/10 blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-xl w-full text-center border border-[color:var(--border)] bg-[color:var(--card)]/70 backdrop-blur-xl rounded-3xl px-8 py-14 shadow-lg transition-all duration-300">
        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl bg-[color:var(--primary)] mx-auto flex items-center justify-center text-5xl text-[color:var(--primary-foreground)] shadow-lg transition-all duration-300">
          💬
        </div>

        {/* Heading */}
        <h1 className="text-[color:var(--foreground)] text-4xl md:text-5xl font-bold tracking-tight mt-8">
          Welcome to  Spike
        </h1>

        {/* Description */}
        <p className="text-[color:var(--muted-foreground)] mt-5 leading-8 text-base md:text-lg max-w-lg mx-auto">
          Select a conversation from the sidebar and start chatting with your
          team in real-time using your beautifully themed workspace.
        </p>

        {/* Button */}
        <button className="mt-8 px-7 py-3 rounded-2xl bg-[color:var(--primary)] hover:bg-[color:var(--accent)] text-[color:var(--primary-foreground)] font-semibold text-lg transition-all duration-300 shadow-lg backdrop-blur-xl border border-[color:var(--border)]">
          Start Messaging
        </button>
      </div>
    </div>
  );
};

export default ChatWelcome;
