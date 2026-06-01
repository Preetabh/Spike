

import React from "react";

const EmptyState = () => {
  return (
    <div className="relative flex-1 flex items-center justify-center px-6 overflow-hidden bg-[color:var(--background)] text-[color:var(--foreground)]">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-[color:var(--primary)]/10 blur-3xl"></div>

        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[color:var(--accent)]/10 blur-3xl"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 max-w-2xl w-full text-center border border-[color:var(--border)] bg-[color:var(--card)]/70 backdrop-blur-xl rounded-3xl px-8 md:px-12 py-14 shadow-lg transition-all duration-300">
        {/* Icon */}
        <div className="w-28 h-28 rounded-3xl bg-[color:var(--sidebar)] border border-[color:var(--border)] mx-auto flex items-center justify-center text-6xl text-[color:var(--foreground)] shadow-lg backdrop-blur-xl transition-all duration-300">
          💬
        </div>

        {/* Heading */}
        <h1 className="text-[color:var(--foreground)] text-4xl md:text-5xl font-bold tracking-tight mt-8">
          No Conversation Selected
        </h1>

        {/* Description */}
        <p className="text-[color:var(--muted-foreground)] text-base md:text-lg mt-5 leading-8 max-w-xl mx-auto">
          Choose a channel, group, or direct message from the sidebar to start
          collaborating with your workspace members in real-time.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button className="px-7 py-3 rounded-2xl bg-[color:var(--primary)] hover:bg-[color:var(--accent)] text-[color:var(--primary-foreground)] font-semibold text-lg shadow-lg transition-all duration-300 border border-[color:var(--border)] backdrop-blur-xl">
            Start New Conversation
          </button>

          <button className="px-7 py-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]/60 hover:bg-[color:var(--accent)] text-[color:var(--foreground)] font-medium text-lg shadow-lg transition-all duration-300 backdrop-blur-xl">
            Explore Channels
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
