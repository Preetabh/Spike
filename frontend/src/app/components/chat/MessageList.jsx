

import React from "react";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages = [] }) => {
  return (
    <div className="relative flex-1 overflow-y-auto bg-[color:var(--background)] px-4 md:px-6 py-6 no-scrollbar">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[color:var(--primary)]/5 blur-3xl"></div>

        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[color:var(--accent)]/5 blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Date Divider */}
        <div className="flex items-center justify-center mb-8">
          <div className="px-4 py-1.5 rounded-full bg-[color:var(--card)] border border-[color:var(--border)] text-xs text-[color:var(--muted-foreground)] shadow-lg backdrop-blur-xl transition-all duration-300">
            Today
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-2">
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          ) : (
            <div className="h-full flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                {/* Icon */}
                <div className="w-24 h-24 rounded-3xl bg-[color:var(--card)] border border-[color:var(--border)] flex items-center justify-center mx-auto text-5xl shadow-lg backdrop-blur-xl transition-all duration-300 text-[color:var(--foreground)]">
                  💬
                </div>

                {/* Heading */}
                <h2 className="text-[color:var(--foreground)] text-3xl font-semibold tracking-tight mt-7">
                  No messages yet
                </h2>

                {/* Description */}
                <p className="text-[color:var(--muted-foreground)] mt-4 text-sm md:text-base max-w-sm leading-8 mx-auto">
                  Start the conversation by sending your first message to this
                  chat workspace.
                </p>

                {/* CTA */}
                <button className="mt-8 px-6 py-3 rounded-2xl bg-[color:var(--primary)] hover:bg-[color:var(--accent)] text-[color:var(--primary-foreground)] font-semibold shadow-lg border border-[color:var(--border)] transition-all duration-300 backdrop-blur-xl">
                  Send First Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageList;
