"use client";

import React, { useState, useEffect, useRef } from "react";
import { Smile, Trash2, Edit3, Check, X, Trash, CheckCheck, Phone, Video } from "lucide-react";

const MessageBubble = ({ message, currentUserId }) => {
  const isOwn = message.senderId === currentUserId || message.isOwn;
  const senderName = message?.sender?.fullName || message?.sender?.name || "User";
  const messageText = message?.content || message?.text || "";

  // Render Call History System Messages
  if (message.messageType === "system" || message.type === "system") {
    const isVideo = messageText.toLowerCase().includes("video");
    const isMissedOrDeclined = messageText.toLowerCase().includes("missed") || messageText.toLowerCase().includes("declined");

    return (
      <div className="flex justify-center w-full mb-5 px-3 sm:px-6 select-none animate-message-appear">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-zinc-950/60 border border-white/5 text-[11px] font-bold shadow-inner tracking-wide text-neutral-400">
          {isVideo ? (
            <Video size={13} className={isMissedOrDeclined ? "text-red-400" : "text-green-400"} />
          ) : (
            <Phone size={13} className={isMissedOrDeclined ? "text-red-400" : "text-green-400"} />
          )}
          <span>{messageText}</span>
        </div>
      </div>
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(messageText);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);

  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const prevReactionsRef = useRef(message.reactions || []);

  const timeString = message?.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : message?.time || "";

  const reactions = message.reactions || [];

  useEffect(() => {
    const prevReactions = prevReactionsRef.current;
    if (reactions.length > prevReactions.length) {
      const added = reactions.filter(
        (r) => !prevReactions.some((pr) => pr.id === r.id)
      );
      added.forEach((react) => {
        const id = Math.random().toString(36).substr(2, 9);
        const leftPos = Math.floor(Math.random() * 50 + 25);
        setFloatingEmojis((prev) => [...prev, { id, emoji: react.emoji, left: leftPos }]);
        setTimeout(() => {
          setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
        }, 1100);
      });
    }
    prevReactionsRef.current = reactions;
  }, [reactions]);

  // Group reactions by emoji symbol
  const groupedReactions = reactions.reduce((acc, curr) => {
    acc[curr.emoji] = acc[curr.emoji] || [];
    acc[curr.emoji].push(curr);
    return acc;
  }, {});

  const handleEditSave = async () => {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/messages/${message.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editText.trim() }),
        credentials: "include",
      });
      if (res.ok) {
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to edit message:", err);
    }
  };

  const handleDelete = async (type) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/messages/${message.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
        credentials: "include",
      });
      setShowDeleteDropdown(false);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleToggleReaction = async (emoji) => {
    const userReaction = reactions.find(
      (r) => r.userId === currentUserId && r.emoji === emoji
    );

    try {
      if (userReaction) {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/messages/${message.id}/reactions`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji }),
          credentials: "include",
        });
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/messages/${message.id}/reactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji }),
          credentials: "include",
        });
      }
      setShowEmojiPicker(false);
    } catch (err) {
      console.error("Failed to toggle reaction:", err);
    }
  };

  const quickEmojis = ["👍", "❤️", "🔥", "😂", "🎉", "👏"];

  return (
    <div
      className={`group relative flex ${
        isOwn ? "justify-end" : "justify-start"
      } mb-5 px-3 sm:px-6 animate-message-appear transition-all duration-300`}
    >
      <div className="relative max-w-[85%] sm:max-w-[75%] md:max-w-[65%]">
        {/* Floating action bar on hover */}
        {!isEditing && (
          <div
            className={`absolute -top-4 z-25 flex items-center gap-1 rounded-xl border border-white/10 bg-neutral-950/95 px-2 py-1 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-md ${
              isOwn ? "right-2" : "left-2"
            }`}
          >
            {/* Quick reaction trigger */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95 transition"
              title="Add Reaction"
            >
              <Smile size={14} />
            </button>

            {/* Edit message trigger (sender only) */}
            {isOwn && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditText(messageText);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95 transition"
                title="Edit Message"
              >
                <Edit3 size={14} />
              </button>
            )}

            {/* Delete message trigger */}
            <button
              onClick={() => {
                if (isOwn) {
                  setShowDeleteDropdown(!showDeleteDropdown);
                } else {
                  handleDelete("me");
                }
              }}
              className="p-1 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition"
              title="Delete Message"
            >
              <Trash2 size={14} />
            </button>

            {/* Delete Dropdown Menu */}
            {showDeleteDropdown && (
              <div className="absolute right-0 top-7 w-44 rounded-xl border border-white/10 bg-zinc-950 p-1.5 shadow-2xl backdrop-blur-xl z-30 space-y-1">
                <button
                  onClick={() => handleDelete("me")}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-neutral-300 hover:bg-white/5 hover:text-white transition"
                >
                  Delete for Me
                </button>
                <button
                  onClick={() => handleDelete("everyone")}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                >
                  Delete for Everyone
                </button>
              </div>
            )}

            {/* Quick Emojis Picker Overlay */}
            {showEmojiPicker && (
              <div className="absolute left-0 bottom-7 flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-950 p-2 shadow-2xl backdrop-blur-xl z-30">
                {quickEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleToggleReaction(emoji)}
                    className="w-7 h-7 flex items-center justify-center text-sm rounded-lg hover:bg-white/10 active:scale-90 transition transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bubble Layout Container */}
        <div
          className={`relative px-3.5 py-2.5 rounded-[20px] shadow-2xl border transition-all duration-300 ${
            isOwn
              ? "bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] text-white border-transparent rounded-br-sm shadow-[color:var(--primary)]/10"
              : "bg-muted/50 backdrop-blur-md text-foreground border-border rounded-bl-sm"
          }`}
        >
          {/* Glow Shading */}
          <div className="absolute inset-0 pointer-events-none opacity-40 rounded-[20px] overflow-hidden">
            <div
              className={`absolute inset-0 ${
                isOwn
                  ? "bg-gradient-to-t from-white/10 to-transparent"
                  : "bg-gradient-to-t from-white/5 to-transparent"
              }`}
            />
          </div>

          <div className="relative z-10 flex flex-col">
            {/* Sender Metadata */}
            {!isOwn && (
              <span className="text-[11px] font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1 tracking-wide">
                {senderName}
              </span>
            )}

            {/* Message Body Content / Editing Field */}
            {isEditing ? (
              <div className="flex flex-col gap-2 mt-1 min-w-[200px] sm:min-w-[300px]">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-neutral-100 outline-none focus:border-[color:var(--primary)]/50 resize-none max-h-24 no-scrollbar"
                  rows={2}
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition"
                    title="Cancel"
                  >
                    <X size={12} />
                  </button>
                  <button
                    onClick={handleEditSave}
                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-[color:var(--primary)] text-white hover:opacity-90 transition shadow-md"
                    title="Save"
                  >
                    <Check size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`text-[13px] sm:text-[14px] leading-relaxed break-words whitespace-pre-wrap overflow-hidden ${isOwn ? "text-white/95" : "text-foreground/95"}`}>
                {/* Render Media Attachments */}
                {message.mediaUrl && (message.messageType === "image" || message.mediaType === "image" || message.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i)) && (
                  <div className="mt-1 mb-3 flex flex-col gap-1.5 max-w-xs sm:max-w-sm">
                    <div className="rounded-2xl overflow-hidden border border-border shadow-sm hover:opacity-95 transition-opacity">
                      <img src={message.mediaUrl} alt="Attachment" className="w-full h-auto max-h-60 object-cover" />
                    </div>
                    <a
                      href={message.mediaUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-xl bg-card/90 border border-border text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted font-semibold transition shadow-sm self-start"
                    >
                      📥 Download Image
                    </a>
                  </div>
                )}

                {message.mediaUrl && (message.messageType === "video" || message.mediaType === "video" || message.mediaUrl.match(/\.(mp4|webm|ogg|mov)/i)) && (
                  <div className="mt-1 mb-3 flex flex-col gap-1.5 max-w-xs sm:max-w-sm">
                    <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
                      <video src={message.mediaUrl} controls className="w-full h-auto max-h-60" />
                    </div>
                    <a
                      href={message.mediaUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-xl bg-card/90 border border-border text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted font-semibold transition shadow-sm self-start"
                    >
                      📥 Download Video
                    </a>
                  </div>
                )}

                {message.mediaUrl && (message.messageType === "audio" || message.mediaType === "audio" || message.mediaUrl.match(/\.(mp3|wav|ogg|webm|m4a)/i)) && (
                  <div className="mt-1 mb-3 flex flex-col gap-1.5 max-w-xs sm:max-w-sm">
                    <div className="rounded-2xl overflow-hidden p-2 bg-card/90 border border-border shadow-sm flex items-center justify-center min-w-[200px] sm:min-w-[260px]">
                      <audio src={message.mediaUrl} controls className="w-full h-8 outline-none text-xs" />
                    </div>
                    <a
                      href={message.mediaUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-xl bg-card/90 border border-border text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted font-semibold transition shadow-sm self-start"
                    >
                      📥 Download Audio
                    </a>
                  </div>
                )}

                {message.mediaUrl && 
                  !(message.messageType === "image" || message.mediaType === "image" || message.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i)) &&
                  !(message.messageType === "video" || message.mediaType === "video" || message.mediaUrl.match(/\.(mp4|webm|ogg|mov)/i)) &&
                  !(message.messageType === "audio" || message.mediaType === "audio" || message.mediaUrl.match(/\.(mp3|wav|ogg|webm|m4a)/i)) && (
                    <div className="mt-1 mb-3">
                      <a
                        href={message.mediaUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border text-xs text-[color:var(--primary)] hover:opacity-85 font-semibold transition shadow-sm max-w-xs sm:max-w-sm"
                      >
                        📎 Download Attachment
                      </a>
                    </div>
                )}

                {/* Parse mentions and format dynamically */}
                {(() => {
                  if (!messageText) return "";
                  const parts = messageText.split(/(@[a-zA-Z0-9_\-\.]+)/g);
                  return parts.map((part, idx) => {
                    if (part.startsWith("@") && part.length > 1) {
                      return (
                        <span
                          key={idx}
                          className={`px-1.5 py-0.5 rounded-md font-bold text-[11px] inline-block mx-0.5 shadow-sm border border-transparent transition select-none ${
                            isOwn
                              ? "bg-white/20 text-white border-white/15"
                              : "bg-[color:var(--primary)]/20 text-[color:var(--primary)] border-[color:var(--primary)]/25"
                          }`}
                        >
                          {part}
                        </span>
                      );
                    }
                    return part;
                  });
                })()}

                {message.isEdited && (
                  <span className="text-[9px] text-neutral-500 font-medium ml-1.5 select-none" title={`Edited: ${message.editedAt}`}>
                    (edited)
                  </span>
                )}
              </div>
            )}

            {/* Time & Read Receipts Indicator */}
            <div className="flex justify-end items-center gap-1 mt-2 select-none">
              <span
                className={`text-[9px] tracking-wider transition-all duration-300 ${
                  isOwn ? "text-white/60" : "text-neutral-500"
                }`}
              >
                {timeString}
              </span>
              {isOwn && (
                <span className="flex items-center">
                  {message.seenBy && message.seenBy.length > 0 ? (
                    <CheckCheck size={12} className="text-purple-300 drop-shadow-[0_0_4px_rgba(168,85,247,0.4)]" />
                  ) : (
                    <Check size={12} className="text-white/40" />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Floating Reaction Animations */}
          {floatingEmojis.map((f) => (
            <span
              key={f.id}
              className="absolute animate-float-emoji pointer-events-none text-2xl z-50 select-none"
              style={{
                left: `${f.left}%`,
                bottom: "10px",
              }}
            >
              {f.emoji}
            </span>
          ))}
        </div>

        {/* Message reactions footer strip */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1.5 justify-start ${isOwn ? "justify-end" : "justify-start"}`}>
            {Object.entries(groupedReactions).map(([emoji, reacts]) => {
              const hasReacted = reacts.some((r) => r.userId === currentUserId);
              return (
                <button
                  key={emoji}
                  onClick={() => handleToggleReaction(emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition select-none active:scale-95 transform duration-150 ${
                    hasReacted
                      ? "bg-[color:var(--primary)]/10 text-[color:var(--primary)] border-[color:var(--primary)]/30 shadow-sm"
                      : "bg-muted text-muted-foreground border-border hover:border-muted-foreground/30 hover:text-foreground"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{reacts.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
