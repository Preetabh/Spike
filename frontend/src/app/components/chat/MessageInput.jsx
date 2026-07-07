"use client";

import { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  Smile, 
  Mic, 
  Send, 
  X, 
  Search, 
  Image, 
  Film, 
  FileText, 
  Music, 
  MicOff 
} from "lucide-react";
import { getSocket } from "../../../sockets/socket.js";

const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    icon: "😊",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🫨", "🫠", "🙄", "😯", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕"]
  },
  {
    name: "Gestures",
    icon: "👍",
    emojis: ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "👂", "👃", "🧠", "🦷", "🦴", "👀", "👁️", "👅", "👄", "💋", "🩸"]
  },
  {
    name: "Hearts & Symbols",
    icon: "❤️",
    emojis: ["❤️", "🩷", "🧡", "💛", "💚", "💙", "🩵", "💜", "🖤", "🩶", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🔀", "🔁", "🔂", "▶️", "⏩", "⏭️", "⏯️", "◀️", "⏪", "⏮️", "🔼", "🏁", "🚩", "🎌", "🏴", "🏳️"]
  },
  {
    name: "Animals",
    icon: "🐱",
    emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌", "🐞", "🐜", "🪰", "🪲", "🪳", "🦂", "🕸️", "🕷️", "🐢", "🐍", "🦎", "🐙", "🦑", "🦞", "🦀", "🦐", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🐈", "🐓", "🦃", "𦤤", "𦤚", "🦜", "🦢", "𦤩", "🕊️", "🐇", "𦤝", "𦤞", "𦤟", "𦤠", "🦦", "𦤥"]
  },
  {
    name: "Food",
    icon: "🍕",
    emojis: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕", "🥪", "🌮", "🌯", "🍲", "🥣", "🥗", "🍿", "🧈", "🔑", "🥫"]
  }
];

const MessageInput = ({ conversationId }) => {
  const [value, setValue] = useState("");
  const [mentionQuery, setMentionQuery] = useState(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Custom emoji picker states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [emojiCategory, setEmojiCategory] = useState("Smileys");

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const emojiPickerRef = useRef(null);

  const params = useParams();
  const workspaceId = params?.id;

  // Handle outside click to close emoji picker
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showEmojiPicker]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/messages/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setAttachment({
        url: data.url,
        type: data.mediaType,
        fileName: data.fileName,
      });
    } catch (err) {
      console.error("File upload error:", err);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Voice message states & refs
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const options = { mimeType: "audio/webm" };
      
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Disconnect all tracks
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", audioBlob, "voice-message.webm");

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/messages/upload`, {
            method: "POST",
            body: formData,
            credentials: "include",
          });

          if (!res.ok) throw new Error("Upload failed");
          const data = await res.json();

          // Send voice message
          const socket = getSocket();
          socket?.emit("send-message", {
            conversationId,
            content: "",
            mediaUrl: data.url,
            mediaType: "audio",
            messageType: "audio",
          });
        } catch (err) {
          console.error("Voice message upload failed:", err);
          alert("Failed to send voice message.");
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Mic access denied or error:", err);
      alert("Microphone access is required to record voice messages.");
    }
  };

  const stopRecording = (shouldSend = true) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      if (!shouldSend) {
        mediaRecorderRef.current.onstop = () => {
          mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        };
      }
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

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

    if (!trimmed && !attachment) return;
    if (!conversationId) return;

    const socket = getSocket();

    socket?.emit("send-message", {
      conversationId,
      content: trimmed,
      mediaUrl: attachment?.url || null,
      mediaType: attachment?.type || null,
      messageType: attachment?.type || "text",
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
    socket?.emit("typing-stop", { conversationId });

    setValue("");
    setAttachment(null);
    setShowMentions(false);
    setMentionQuery(null);
    textareaRef.current?.focus();
  };

  const handleEmojiSelect = (emoji) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    setValue(before + emoji + after);
    
    // Maintain caret focus index position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + emoji.length;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const formatRecordingTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Filter emojis based on search query
  const getFilteredEmojis = () => {
    if (!emojiSearch.trim()) return EMOJI_CATEGORIES;
    return EMOJI_CATEGORIES.map((cat) => ({
      ...cat,
      emojis: cat.emojis.filter((emoji) => emoji.includes(emojiSearch))
    })).filter((cat) => cat.emojis.length > 0);
  };

  return (
    <div className="relative w-full border-t border-border bg-card/85 px-4 py-3 pb-4 backdrop-blur-xl transition-all duration-200">
      {/* Floating autocomplete mentions dropdown */}
      {showMentions && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-2.5 z-50 max-h-48 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-2xl backdrop-blur-2xl no-scrollbar animate-list-appear">
          <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border mb-1.5">
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
                    : "text-foreground/85 hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white uppercase border border-white/10">
                  {(member.fullName || member.name || "U").charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold truncate">
                    {member.fullName || member.name}
                  </span>
                  <span className={`text-[9px] ${idx === mentionIndex ? "text-white/70" : "text-muted-foreground"} truncate`}>
                    {member.email}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*,audio/*,application/*,text/*"
      />

      {/* Uploading indicator */}
      {isUploading && (
        <div className="relative z-10 flex items-center gap-2 p-2 mb-2 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground animate-pulse">
          <div className="w-3.5 h-3.5 border-2 border-[color:var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          <span>Uploading attachment to Cloudinary...</span>
        </div>
      )}

      {/* Attachment preview */}
      {attachment && (
        <div className="relative z-10 flex items-center justify-between p-2 mb-2 rounded-xl bg-card border border-border text-xs animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-sm">
              {attachment.type === "image" ? (
                <Image size={14} className="text-purple-400" />
              ) : attachment.type === "video" ? (
                <Film size={14} className="text-indigo-400" />
              ) : attachment.type === "audio" ? (
                <Music size={14} className="text-pink-400" />
              ) : (
                <FileText size={14} className="text-sky-400" />
              )}
            </span>
            <span className="font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">{attachment.fileName}</span>
          </div>
          <button
            onClick={() => setAttachment(null)}
            className="w-5 h-5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer border-none outline-none"
            aria-label="Remove attachment"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {isRecording ? (
        /* Voice recording layout */
        <div className="relative flex items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
              Recording Voice Message ({formatRecordingTime(recordingSeconds)})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => stopRecording(false)}
              className="px-3.5 py-1.5 rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground active:scale-95 transition cursor-pointer border-none outline-none bg-transparent"
            >
              Cancel
            </button>
            <button
              onClick={() => stopRecording(true)}
              className="px-4 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold text-white active:scale-95 transition cursor-pointer animate-pulse border-none outline-none"
            >
              Send Voice
            </button>
          </div>
        </div>
      ) : (
        /* Normal text message input layout */
        <div className="relative flex items-end gap-3 rounded-2xl border border-border bg-muted/40 hover:border-border/80 px-4 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 focus-within:border-[color:var(--primary)]/50 focus-within:ring-1 focus-within:ring-[color:var(--primary)]/30">
          {/* subtle background glow */}
          <div className="absolute inset-0 pointer-events-none opacity-40 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--primary)]/5 to-[color:var(--accent)]/5 rounded-2xl"></div>
          </div>

          {/* Custom Popover Emoji Picker */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-14 left-0 w-72 h-80 rounded-2xl bg-card border border-border shadow-2xl backdrop-blur-3xl flex flex-col overflow-hidden z-50 animate-slide-up"
            >
              {/* Emoji search bar */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20">
                <Search size={13} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search emojis..."
                  value={emojiSearch}
                  onChange={(e) => setEmojiSearch(e.target.value)}
                  className="flex-1 bg-transparent text-xs border-none outline-none text-foreground placeholder:text-muted-foreground"
                />
                {emojiSearch && (
                  <button onClick={() => setEmojiSearch("")} className="text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Emoji tab headers */}
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-muted/40">
                {EMOJI_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      setEmojiCategory(cat.name);
                      const element = document.getElementById(`emoji-sec-${cat.name}`);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
                      }
                    }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition cursor-pointer border-none outline-none ${
                      emojiCategory === cat.name ? "bg-primary text-primary-foreground font-bold shadow-md" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {cat.icon}
                  </button>
                ))}
              </div>

              {/* Emoji scroll list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
                {getFilteredEmojis().map((cat) => (
                  <div key={cat.name} id={`emoji-sec-${cat.name}`} className="space-y-1.5">
                    <h4 className="text-[10px] uppercase font-black text-muted-foreground tracking-wider select-none">
                      {cat.name}
                    </h4>
                    <div className="grid grid-cols-8 gap-1.5">
                      {cat.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleEmojiSelect(emoji)}
                          className="w-7 h-7 flex items-center justify-center text-lg hover:bg-muted hover:scale-120 active:scale-95 rounded-lg transition duration-150 cursor-pointer border-none outline-none select-none bg-transparent"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {getFilteredEmojis().length === 0 && (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    No matching emojis found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Left Actions */}
          <div className="relative z-10 flex items-center gap-2 pb-0.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="add"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition duration-200 active:scale-90 cursor-pointer border-none outline-none bg-transparent"
            >
              <Plus size={18} />
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              aria-label="emoji"
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition duration-200 active:scale-90 cursor-pointer border-none outline-none ${
                showEmojiPicker ? "bg-muted text-[color:var(--primary)]" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              } bg-transparent`}
            >
              <Smile size={18} />
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
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-[14px] sm:text-[15px] leading-6 max-h-32 overflow-y-auto pr-2 no-scrollbar border-none"
              aria-label="Message input"
            />

            {/* Bottom hint info */}
            <div className="flex items-center justify-between mt-1.5 gap-3 flex-wrap">
              <p className="text-[10px] text-muted-foreground font-medium">
                Shift + Enter for newline
              </p>
              <p className="text-[10px] text-muted-foreground/80 font-medium">
                Markdown supported
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="relative z-10 flex items-center gap-2 pb-0.5">
            <button
              type="button"
              onClick={startRecording}
              aria-label="voice"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition duration-200 active:scale-90 cursor-pointer animate-pulse-glow border-none outline-none bg-transparent"
            >
              <Mic size={18} />
            </button>

            {/* Glowing gradients send icon button */}
            <button
              type="button"
              onClick={handleSend}
              aria-label="send"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] hover:shadow-[color:var(--primary)]/20 active:scale-95 transition transform duration-200 cursor-pointer border-none outline-none"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
