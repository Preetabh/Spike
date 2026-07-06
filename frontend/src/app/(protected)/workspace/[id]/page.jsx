"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { 
  MessageSquare, 
  Hash, 
  Users, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Users2,
  BellRing
} from "lucide-react";
import Avatar from "../../../components/common/Avtar";

export default function WorkspaceDashboard() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params?.id;

  // 1. Fetch workspace details
  const { data: workspace, isLoading: workspaceLoading } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspaces/${workspaceId}`, {
        credentials: "include",
      });
      const data = await res.json();
      return data?.data || data;
    },
    enabled: !!workspaceId,
  });

  // 2. Fetch channels
  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ["channels", workspaceId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/channels?workspace=${workspaceId}`, {
        credentials: "include",
      });
      return res.json();
    },
    enabled: !!workspaceId,
  });

  // 3. Fetch groups
  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["groups", workspaceId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/groups?workspace=${workspaceId}`, {
        credentials: "include",
      });
      return res.json();
    },
    enabled: !!workspaceId,
  });

  // 4. Fetch DMs
  const { data: dms = [], isLoading: dmsLoading } = useQuery({
    queryKey: ["dm", workspaceId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/dm?workspaceId=${workspaceId}`, {
        credentials: "include",
      });
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const isLoading = workspaceLoading || channelsLoading || groupsLoading || dmsLoading;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[color:var(--background)] text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[color:var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold tracking-wider">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Combine all conversations for a unified "Recent Activity" feed
  const combinedRecents = [];

  // Add channels with last message info
  channels.forEach(ch => {
    if (ch.lastMessage) {
      combinedRecents.push({
        id: ch.id,
        name: ch.title || ch.name,
        type: "channel",
        lastMessage: ch.lastMessage,
        unreadCount: ch.unreadCount || 0,
        path: `/workspace/${workspaceId}/channels/${ch.id}`,
      });
    }
  });

  // Add groups with last message info
  groups.forEach(g => {
    if (g.lastMessage) {
      combinedRecents.push({
        id: g.id,
        name: g.title || g.name,
        type: "group",
        lastMessage: g.lastMessage,
        unreadCount: g.unreadCount || 0,
        path: `/workspace/${workspaceId}/groups/${g.id}`,
      });
    }
  });

  // Add DMs (members list with conversation / last message)
  dms.forEach(dm => {
    if (dm.lastMessage) {
      combinedRecents.push({
        id: dm.id,
        name: dm.fullName || dm.name,
        type: "dm",
        lastMessage: dm.lastMessage,
        unreadCount: dm.unreadCount || 0,
        avatar: dm.avatar,
        isOnline: dm.isOnline,
        path: `/workspace/${workspaceId}/dm/${dm.id}`,
      });
    }
  });

  // Sort recents by date descending
  combinedRecents.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

  // Find online team members
  const onlineMembers = dms.filter(member => member.isOnline);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[color:var(--background)] px-4 md:px-8 py-6 relative select-none no-scrollbar">
      {/* Background Decorative Glows */}
      <div className="absolute top-10 left-10 w-[350px] h-[350px] rounded-full bg-[color:var(--primary)]/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-[400px] h-[400px] rounded-full bg-[color:var(--accent)]/5 blur-3xl pointer-events-none"></div>

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-gradient-to-r from-neutral-900/50 to-neutral-900/10 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl animate-list-appear">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[color:var(--primary)] mb-2">
            <Sparkles size={12} />
            <span>Spike Workspace Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none mb-3">
            Welcome to {workspace?.name || "Workspace"}
          </h1>
          <p className="text-neutral-400 text-sm max-w-xl leading-relaxed">
            {workspace?.description || "Collaborate with your team instantly via channels, direct messages, and groups."}
          </p>
        </div>

        {/* Workspace Quick Stats */}
        <div className="flex items-center gap-6 self-start md:self-center">
          <div className="flex flex-col items-center bg-white/5 border border-white/5 rounded-2xl px-5 py-3 backdrop-blur-md">
            <span className="text-2xl font-black text-white">{channels.length}</span>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">Channels</span>
          </div>
          <div className="flex flex-col items-center bg-white/5 border border-white/5 rounded-2xl px-5 py-3 backdrop-blur-md">
            <span className="text-2xl font-black text-white">{groups.length}</span>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">Groups</span>
          </div>
          <div className="flex flex-col items-center bg-white/5 border border-white/5 rounded-2xl px-5 py-3 backdrop-blur-md">
            <span className="text-2xl font-black text-white">{dms.length + 1}</span>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">Members</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left Column: Recent Activity Feed */}
        <div className="lg:col-span-2 flex flex-col gap-6 animate-list-appear" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[color:var(--primary)]" />
              <h2 className="text-lg font-bold text-white tracking-tight">Recent Activity</h2>
            </div>
            {combinedRecents.length > 0 && (
              <span className="text-xs text-neutral-500 font-medium">{combinedRecents.length} active chats</span>
            )}
          </div>

          {combinedRecents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-3xl bg-neutral-900/20 backdrop-blur-sm">
              <MessageSquare size={32} className="text-neutral-600 mb-3" />
              <p className="text-neutral-400 text-sm font-medium">No recent conversations yet</p>
              <p className="text-neutral-500 text-xs mt-1">Start chatting by choosing a channel or user on the left!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {combinedRecents.slice(0, 5).map((recent) => (
                <div
                  key={recent.id}
                  onClick={() => router.push(recent.path)}
                  className="group relative flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-neutral-900/30 hover:bg-neutral-900/60 hover:border-white/10 cursor-pointer transition transform hover:scale-[1.01] hover:-translate-y-[1px] active:scale-[0.99] duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Icon / Avatar based on chat type */}
                    {recent.type === "channel" && (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-base shadow-md border border-white/10">
                        <Hash size={16} />
                      </div>
                    )}
                    {recent.type === "group" && (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-base shadow-md border border-white/10">
                        <Users size={16} />
                      </div>
                    )}
                    {recent.type === "dm" && (
                      <Avatar
                        name={recent.name}
                        src={recent.avatar}
                        status={recent.isOnline}
                        type="dm"
                        size="md"
                      />
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm group-hover:text-[color:var(--primary)] transition-colors truncate">
                          {recent.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/5 text-neutral-400">
                          {recent.type}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate mt-1">
                        <span className="text-neutral-500 font-semibold">{recent.lastMessage.senderId === recent.id ? recent.name : "You"}: </span>
                        {recent.lastMessage.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Time & Unread Badge */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] text-neutral-500">
                        {new Date(recent.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {recent.unreadCount > 0 && (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                          {recent.unreadCount}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={14} className="text-neutral-600 group-hover:text-white group-hover:translate-x-0.5 transition duration-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Online Members sidebar */}
        <div className="flex flex-col gap-6 animate-list-appear" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-2">
            <Users2 size={16} className="text-[color:var(--primary)]" />
            <h2 className="text-lg font-bold text-white tracking-tight">Active Team</h2>
          </div>

          <div className="border border-white/5 rounded-3xl bg-neutral-900/20 backdrop-blur-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-white/5 pb-3">
              <span>Online Now</span>
              <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-extrabold text-[10px]">
                {onlineMembers.length} active
              </span>
            </div>

            {onlineMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-neutral-600">
                <p className="text-xs text-neutral-500 font-medium">Everyone is away</p>
                <p className="text-[10px] text-neutral-600 mt-0.5">We will keep an eye out for updates!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-80 overflow-y-auto no-scrollbar">
                {onlineMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => router.push(`/workspace/${workspaceId}/dm/${member.id}`)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer transition duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={member.fullName || member.name}
                        src={member.avatar}
                        status={true}
                        type="dm"
                        size="sm"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white truncate max-w-[120px]">{member.fullName || member.name}</span>
                        <span className="text-[9px] text-green-400 font-medium mt-0.5">Available</span>
                      </div>
                    </div>
                    <button className="text-[10px] text-[color:var(--primary)] font-bold hover:text-white transition uppercase tracking-wider">
                      Chat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
