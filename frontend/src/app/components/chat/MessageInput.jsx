"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSocket } from "../../../sockets/socket.js";

const MessageInput = ({ conversationId }) => {
  const [value, setValue] = useState("");
  const [mentionQuery, setMentionQuery] = useState(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);

  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const params = useParams();
  const workspaceId = params?.id;

  // Fetch workspace members for @mention dropdown autocomplete
  const { data: members = [] } = useQuery({
    queryKey: ["dm", workspaceId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/dm?workspaceId=${workspaceId}`, {
        credentials: "include",
      });
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const filteredMembers = members.filter((m) =>
    (m.fullName || m.name || "")
      .toLowerCase()
      .includes((mentionQuery || "").toLowerCase())
  );

  const handleSelectMention = (member) => {
    const text = value;
    const selectionStart = textareaRef.current?.selectionStart || text.length;
    const textBeforeCursor = text.substring(0, selectionStart);
    const textAfterCursor = text.substring(selectionStart);
    
    const words = textBeforeCursor.split(/\s+/);
    words[words.length - 1] = `@${member.fullName || member.name}`;
    const newTextBeforeCursor = words.join(" ") + " ";
    
    setValue(newTextBeforeCursor + textAfterCursor);
    setShowMentions(false);
    setMentionQuery(null);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setValue(val);

    if (conversationId) {
      const socket = getSocket();
      if (socket) {
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
      }
    }

    // Check for @mention query
    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = val.substring(0, selectionStart);
    const words = textBeforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord && lastWord.startsWith("@")) {
      const q = lastWord.substring(1);
      setMentionQuery(q);
      setShowMentions(true);
      setMentionIndex(0);
    } else {
      setShowMentions(false);
      setMentionQuery(null);
    }
  };

  const handleKeyDown = (e) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((prev) => (prev + 1) % filteredMembers.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleSelectMention(filteredMembers[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowMentions(false);
        setMentionQuery(null);
        return;
      }
    }

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
    setShowMentions(false);
    setMentionQuery(null);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative w-full border-t border-white/5 bg-[#09090b]/80 px-4 py-3 pb-[72px] md:pb-4 backdrop-blur-xl transition-all duration-200">
      {/* Floating autocomplete mentions dropdown */}
      {showMentions && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-2.5 z-50 max-h-48 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-2xl no-scrollbar animate-list-appear">
          <div className="px-2.5 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider border-b border-white/5 mb-1.5">
            Workspace Members
          </div>
          <div className="space-y-1">
            {filteredMembers.map((member, idx) => (
              <div
                key={member.id}
                onClick={() => handleSelectMention(member)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition select-none ${
                  idx === mentionIndex
                    ? "bg-[color:var(--primary)] text-white shadow-lg shadow-[color:var(--primary)]/20 animate-pulse-subtle"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white uppercase border border-white/10">
                  {(member.fullName || member.name || "U").charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold truncate">
                    {member.fullName || member.name}
                  </span>
                  <span className={`text-[9px] ${idx === mentionIndex ? "text-white/70" : "text-neutral-500"} truncate`}>
                    {member.email}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            placeholder="Type a message... use @ to mention"
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
