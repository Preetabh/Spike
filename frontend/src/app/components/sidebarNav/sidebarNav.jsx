"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Hash,
  MessageCircle,
  Users,
  Settings,
  User,
  LogOut,
  Pencil,
  Building2,
  UserPen,
} from "lucide-react";
import Image from "next/image";

export default function SidebarNav({
  id,
  workspace,
  user,
  isOwner,
  onOpenSettings,
}) {
  const [openProfile, setOpenProfile] = useState(false);
  const [workspaceSettings, setOpenWorkspaceSettings] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const workspaceInitials = workspace?.name?.charAt(0) || "W";
  const userInitials = user?.fullName?.charAt(0) || "U";

  const isHomeActive = pathname === `/workspace/${id}`;
  const isChannelsActive = pathname.startsWith(`/workspace/${id}/channels`);
  const isDmActive = pathname.startsWith(`/workspace/${id}/dm`);
  const isGroupsActive = pathname.startsWith(`/workspace/${id}/groups`);

  const getLinkClasses = (isActive) => {
    return `flex flex-col items-center gap-1.5 transition-all duration-200 ${
      isActive ? "text-white scale-105 font-bold" : "text-neutral-400 hover:text-white hover:scale-105 active:scale-95"
    }`;
  };

  const getIconContainerClasses = (isActive) => {
    return `w-10 h-10 rounded-xl border flex items-center justify-center transition duration-200 relative group ${
      isActive
        ? "bg-[color:var(--primary)] border-[color:var(--primary)]/60 text-white shadow-[0_0_14px_rgba(97,31,105,0.4)]"
        : "bg-neutral-900/50 border-white/5 text-neutral-300 hover:text-white hover:bg-neutral-800"
    }`;
  };

  return (
    <div className="w-20 bg-[#09090b]/80 text-neutral-400 hidden md:flex flex-col items-center py-6 gap-8 font-medium border-r border-white/5 relative z-20 backdrop-blur-xl">
      {/* Workspace Icon */}
      <div className="w-11 h-11 bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg border border-white/10 select-none cursor-pointer transform hover:rotate-6 transition duration-200">
        {workspaceInitials}
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-7 text-[10px] uppercase tracking-wider items-center mt-4 w-full">
        <Link
          href={`/workspace/${id}`}
          className={getLinkClasses(isHomeActive)}
        >
          <div className={getIconContainerClasses(isHomeActive)}>
            {isHomeActive && <span className="absolute left-[-4px] top-1/4 bottom-1/4 w-1 bg-white rounded-r-full"></span>}
            <Home size={18} />
          </div>
          <span>Home</span>
        </Link>

        <Link
          href={`/workspace/${id}/channels`}
          className={getLinkClasses(isChannelsActive)}
        >
          <div className={getIconContainerClasses(isChannelsActive)}>
            {isChannelsActive && <span className="absolute left-[-4px] top-1/4 bottom-1/4 w-1 bg-white rounded-r-full"></span>}
            <Hash size={18} />
          </div>
          <span>Channels</span>
        </Link>

        <Link
          href={`/workspace/${id}/dm`}
          className={getLinkClasses(isDmActive)}
        >
          <div className={getIconContainerClasses(isDmActive)}>
            {isDmActive && <span className="absolute left-[-4px] top-1/4 bottom-1/4 w-1 bg-white rounded-r-full"></span>}
            <MessageCircle size={18} />
          </div>
          <span>Messages</span>
        </Link>

        <Link
          href={`/workspace/${id}/groups`}
          className={getLinkClasses(isGroupsActive)}
        >
          <div className={getIconContainerClasses(isGroupsActive)}>
            {isGroupsActive && <span className="absolute left-[-4px] top-1/4 bottom-1/4 w-1 bg-white rounded-r-full"></span>}
            <Users size={18} />
          </div>
          <span>Groups</span>
        </Link>

        {isOwner && (
          <div
            onClick={() => setOpenWorkspaceSettings(!workspaceSettings)}
            className="flex flex-col cursor-pointer items-center gap-1.5 hover:text-white hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-900/50 hover:bg-neutral-800 border border-white/5 flex items-center justify-center text-neutral-300 hover:text-white transition">
              <Settings size={18} />
            </div>
            <span>Admin</span>
          </div>
        )}
      </div>

      {/* Admin pop-up */}
      {workspaceSettings && (
        <div className="absolute bottom-[12%] left-24 bg-neutral-950/95 border border-white/10 rounded-2xl w-72 overflow-hidden shadow-2xl backdrop-blur-xl z-50 animate-list-appear p-2 flex flex-col gap-1">
          <h1 className="px-3 py-2 font-bold text-xs uppercase tracking-wider text-neutral-500">
            Admin Panel
          </h1>
          <div className="h-[1px] bg-white/5 my-1"></div>
          
          <div className="flex items-center p-3 gap-3 rounded-xl bg-neutral-900/40 border border-white/5">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center font-bold text-purple-400 text-sm">
              {workspaceInitials}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-semibold text-white truncate">{workspace?.name}</p>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mt-0.5">
                {workspace?.plan || "Free"}
              </p>
            </div>
          </div>
          
          <div className="h-[1px] bg-white/5 my-1"></div>

          <div
            onClick={() => {
              router.push(`/workspace/${id}/settings?tab=workspace`);
              setOpenWorkspaceSettings(false);
            }}
            className="px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition cursor-pointer flex items-center gap-3 text-xs font-medium"
          >
            <Building2 size={15} /> Workspace Settings
          </div>

          <div
            onClick={() => {
              router.push(`/workspace/${id}/settings?tab=edit`);
              setOpenWorkspaceSettings(false);
            }}
            className="px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition cursor-pointer flex items-center gap-3 text-xs font-medium"
          >
            <Pencil size={15} /> Edit Workspace
          </div>

          <div
            onClick={() => {
              router.push(`/workspace/${id}/settings?tab=members`);
              setOpenWorkspaceSettings(false);
            }}
            className="px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition cursor-pointer flex items-center gap-3 text-xs font-medium"
          >
            <UserPen size={15} /> Manage members
          </div>
        </div>
      )}

      {/* Profile */}
      <div className="absolute bottom-6 flex flex-col items-center">
        <div
          onClick={() => setOpenProfile(!openProfile)}
          className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-full flex items-center justify-center cursor-pointer font-bold border border-white/15 shadow-lg select-none hover:scale-105 active:scale-95 transition"
        >
          {userInitials}
        </div>

        {openProfile && (
          <div className="absolute bottom-0 left-14 bg-neutral-950/95 border border-white/10 rounded-2xl w-48 shadow-2xl backdrop-blur-xl z-50 overflow-hidden p-1.5 animate-list-appear flex flex-col gap-1">
            <div
              onClick={() => {
                router.push(`/workspace/${id}/profile`);
                setOpenProfile(false);
              }}
              className="px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition cursor-pointer flex items-center gap-3 text-xs font-medium"
            >
              <User size={15} /> Profile
            </div>

            <div
              onClick={() => {
                onOpenSettings();
                setOpenProfile(false);
              }}
              className="px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition cursor-pointer flex items-center gap-3 text-xs font-medium"
            >
              <Settings size={15} /> Settings
            </div>

            <div
              onClick={() => router.push(`/login`)}
              className="px-3 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-red-500 transition cursor-pointer flex items-center gap-3 text-xs font-medium border-t border-white/5 mt-1"
            >
              <LogOut size={15} /> Sign Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
