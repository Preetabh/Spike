"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { X, Hash, Lock, Globe2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CreateChannelModal({ isOpen, onClose, workspaceId }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Channel name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim().toLowerCase().replace(/\s+/g, "-"),
          workspaceId,
          type: isPrivate ? "private" : "public",
          description: description.trim(),
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create channel");
      }

      toast.success("Channel created successfully! 🎉");
      queryClient.invalidateQueries(["channels", workspaceId]);
      onClose();
      setName("");
      setDescription("");
      setIsPrivate(false);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-list-appear overflow-hidden relative mx-4">
        {/* Glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[color:var(--primary)]/10 to-transparent pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-2 text-white">
            <Hash size={18} className="text-[color:var(--primary)]" />
            <h3 className="text-lg font-bold">Create a Channel</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white hover:bg-white/5 p-1.5 rounded-xl transition active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Channel Name
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-500 font-bold">#</span>
              <input
                type="text"
                placeholder="e.g. project-marketing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                className="w-full bg-neutral-900/50 border border-white/5 hover:border-white/10 focus:border-[color:var(--primary)]/50 focus:ring-1 focus:ring-[color:var(--primary)]/20 rounded-2xl py-3 pl-8 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition duration-200"
              />
            </div>
            <p className="text-[10px] text-neutral-500 mt-1.5 pl-1">
              Names must be lowercase, without spaces or special characters.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="What is this channel about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={150}
              className="w-full bg-neutral-900/50 border border-white/5 hover:border-white/10 focus:border-[color:var(--primary)]/50 focus:ring-1 focus:ring-[color:var(--primary)]/20 rounded-2xl p-3 text-sm text-white placeholder-neutral-600 outline-none transition duration-200 resize-none"
            />
          </div>

          {/* Toggle Type */}
          <div
            onClick={() => setIsPrivate(!isPrivate)}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-neutral-900/35 hover:bg-neutral-900/60 cursor-pointer transition select-none"
          >
            <div className="flex gap-3">
              <div className="mt-0.5 text-neutral-400">
                {isPrivate ? <Lock size={16} className="text-rose-400" /> : <Globe2 size={16} className="text-emerald-400" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">
                  {isPrivate ? "Make Private" : "Public Channel"}
                </span>
                <span className="text-[10px] text-neutral-500 mt-0.5">
                  {isPrivate 
                    ? "Only invited members can view and join." 
                    : "Anyone in the workspace can view and join."}
                </span>
              </div>
            </div>
            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${isPrivate ? "bg-rose-500" : "bg-neutral-800"}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${isPrivate ? "translate-x-4" : "translate-x-0"}`}></div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-white/5 bg-neutral-900 text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--accent)] text-xs font-bold text-white hover:opacity-90 active:scale-95 disabled:opacity-50 transition shadow-lg shadow-[color:var(--primary)]/15"
            >
              {isSubmitting ? "Creating..." : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
