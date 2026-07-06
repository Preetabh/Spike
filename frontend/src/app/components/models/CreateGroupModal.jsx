"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Users, Check, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import Avatar from "../common/Avtar";

export default function CreateGroupModal({ isOpen, onClose, workspaceId }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch workspace members from the DM users endpoint
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["dm", workspaceId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/dm?workspaceId=${workspaceId}`, {
        credentials: "include",
      });
      return res.json();
    },
    enabled: isOpen && !!workspaceId,
  });

  if (!isOpen) return null;

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredMembers = members.filter((member) =>
    (member.fullName || member.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          workspaceId,
          description: description.trim(),
          members: selectedMembers,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create group");
      }

      toast.success("Group created successfully! 🎉");
      queryClient.invalidateQueries(["groups", workspaceId]);
      onClose();
      setName("");
      setDescription("");
      setSelectedMembers([]);
      setSearchQuery("");
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
            <Users size={18} className="text-[color:var(--primary)]" />
            <h3 className="text-lg font-bold">Create a Group</h3>
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
              Group Name
            </label>
            <input
              type="text"
              placeholder="e.g. Design Sync"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-900/50 border border-white/5 hover:border-white/10 focus:border-[color:var(--primary)]/50 focus:ring-1 focus:ring-[color:var(--primary)]/20 rounded-2xl py-3 px-4 text-sm text-white placeholder-neutral-600 outline-none transition duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="What is this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={150}
              className="w-full bg-neutral-900/50 border border-white/5 hover:border-white/10 focus:border-[color:var(--primary)]/50 focus:ring-1 focus:ring-[color:var(--primary)]/20 rounded-2xl p-3 text-sm text-white placeholder-neutral-600 outline-none transition duration-200 resize-none"
            />
          </div>

          {/* Members Select list */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Add Members ({selectedMembers.length} selected)
            </label>

            {/* Search Input */}
            <div className="relative flex items-center mb-2">
              <Search size={14} className="absolute left-3 text-neutral-500" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900/40 border border-white/5 hover:border-white/10 focus:border-[color:var(--primary)]/30 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-neutral-600 outline-none transition duration-200"
              />
            </div>

            {/* Members List Container */}
            <div className="h-36 overflow-y-auto rounded-2xl border border-white/5 bg-neutral-900/20 p-2 space-y-1.5 no-scrollbar">
              {isLoading ? (
                <div className="text-[11px] text-neutral-500 text-center py-4">Loading members...</div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-[11px] text-neutral-500 text-center py-4">No team members found</div>
              ) : (
                filteredMembers.map((member) => {
                  const isChecked = selectedMembers.includes(member.id);
                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition select-none ${
                        isChecked 
                          ? "bg-[color:var(--primary)]/10 border border-[color:var(--primary)]/20" 
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          name={member.fullName || member.name}
                          src={member.avatar}
                          status={member.isOnline}
                          type="dm"
                          size="sm"
                        />
                        <span className="text-xs font-medium text-white truncate">
                          {member.fullName || member.name}
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors duration-200 ${
                        isChecked 
                          ? "bg-[color:var(--primary)] border-[color:var(--primary)] text-white" 
                          : "border-white/20 text-transparent"
                      }`}>
                        <Check size={10} strokeWidth={4} />
                      </div>
                    </div>
                  );
                })
              )}
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
              {isSubmitting ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
