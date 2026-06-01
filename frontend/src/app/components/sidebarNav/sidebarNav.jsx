"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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

  return (
    <div className="w-19 bg-[color:var(--sidebar)] text-[color:var(--sidebar-foreground)] hidden md:flex flex-col items-center py-4 gap-6 font-medium">
      {/* Workspace Icon */}
      <div className="w-10 h-10 bg-[color:var(--sidebar-accent)] rounded-lg flex items-center justify-center font-semibold">
        {workspace?.name?.charAt(0)}
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-6 text-xs items-center mt-6">
        <Link
          href={`/workspace/${id}`}
          className="flex flex-col items-center gap-1 hover:text-[color:var(--primary)] transition"
        >
          <Home size={18} />
          <span>Home</span>
        </Link>

        <Link
          href={`/workspace/${id}/channels`}
          className="flex flex-col items-center gap-1 hover:text-[color:var(--primary)] transition"
        >
          <Hash size={18} />
          <span>Channels</span>
        </Link>

        <Link
          href={`/workspace/${id}/dm`}
          className="flex flex-col items-center gap-1 hover:text-[color:var(--primary)] transition"
        >
          <MessageCircle size={18} />
          <span>Messages</span>
        </Link>

        <Link
          href={`/workspace/${id}/groups`}
          className="flex flex-col items-center gap-1 hover:text-[color:var(--primary)] transition"
        >
          <Users size={18} />
          <span>Groups</span>
        </Link>

        {isOwner && (
          <div
            onClick={() => setOpenWorkspaceSettings(!workspaceSettings)}
            className="flex flex-col cursor-pointer items-center gap-1 hover:text-[color:var(--primary)] transition"
          >
            <Settings size={18} />
            <span>Admin</span>
          </div>
        )}
      </div>

      {/* Admin pop-up */}

      {workspaceSettings && (
        <div className="absolute bottom-[15%] left-17 bg-[color:var(--card)] border border-[color:var(--border)] rounded-lg w-74 overflow-hidden shadow-lg backdrop-blur-md z-50">
          <h1 className="px-4 py-2 font-semibold text-sm">Admin Tools</h1>
          <div className="bg-[color:var(--border)] h-[2px] w-full"></div>
          <div className="flex items-center m-2 gap-3">
            <div className="logo">
              <Image src="/logo.png" alt="Spike Logo" width={30} height={30} />
            </div>
            <div className="flex flex-col ">
              <p className="flex items-center gap-2 ml-2">Current Plan</p>
              <p className=" ml-2 text-[color:var(--primary)]">
                {workspace?.plan}
              </p>
            </div>

            <p className="text-sm font-semibold text-[color:var(--primary)] ml-auto mt-2 cursor-pointer hover:underline">
              Manage billing
            </p>
          </div>
          <div className="bg-[color:var(--border)] h-[2px] w-full"></div>

          <div
            onClick={() => {
              router.push(`/workspace/${id}/settings?tab=workspace`);
              setOpenWorkspaceSettings(false);
            }}
            className="px-4 py-2 hover:bg-[color:var(--accent)] transition cursor-pointer flex items-center gap-2 text-sm"
          >
            <Building2 size={16} /> Workspace Settings
          </div>

          <div
            onClick={() => {
              router.push(`/workspace/${id}/settings?tab=edit`);
              setOpenWorkspaceSettings(false);
            }}
            className="px-4 py-2 hover:bg-[color:var(--accent)] transition cursor-pointer flex items-center gap-2 text-sm"
          >
            <Pencil size={16} /> Edit Workspace
          </div>

          <div
            onClick={() => {
              router.push(`/workspace/${id}/settings?tab=members`);
              setOpenWorkspaceSettings(false);
            }}
            className="px-4 py-2 hover:bg-[color:var(--accent)] transition cursor-pointer flex items-center gap-2 text-sm border-t border-[color:var(--border)]"
          >
            <UserPen size={16} /> Manage members
          </div>
        </div>
      )}

      {/* Profile */}
      <div className="absolute bottom-4 flex flex-col items-center">
        <div
          onClick={() => setOpenProfile(!openProfile)}
          className="w-10 h-10 bg-[color:var(--sidebar-accent)] rounded-full flex items-center justify-center cursor-pointer font-semibold"
        >
          {user?.fullName?.charAt(0)}
        </div>

        {openProfile && (
          <div className="absolute bottom-0 left-17 bg-[color:var(--card)] border border-[color:var(--border)] rounded-lg w-44 shadow-lg backdrop-blur-md z-50 overflow-hidden">
            <div
              onClick={() => router.push(`/workspace/${id}/profile`)}
              className="px-4 py-2 hover:bg-[color:var(--accent)] transition cursor-pointer flex items-center gap-2 text-sm"
            >
              <User size={16} /> Profile
            </div>

            <div
              onClick={onOpenSettings}
              className="px-4 py-2 hover:bg-[color:var(--accent)] transition cursor-pointer flex items-center gap-2 text-sm"
            >
              <Settings size={16} /> Settings
            </div>

            <div
              onClick={() => router.push(`/login`)}
              className="px-4 py-2 hover:bg-red-500/20 text-red-400 cursor-pointer flex items-center gap-2 text-sm border-t border-[color:var(--border)]"
            >
              <LogOut size={16} /> Sign Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
