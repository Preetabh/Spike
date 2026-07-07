"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { User, Settings, LogOut, Shield } from "lucide-react";
import { TbSunset2 } from "react-icons/tb";
import { PiSunDimFill } from "react-icons/pi";
import { IoIosMoon } from "react-icons/io";

export default function TopNavbar({ user, workspace, className = "", onOpenSettings, isOwner }) {
  const hour = new Date().getHours();
  const [openProfile, setOpenProfile] = useState(false);
  const router = useRouter();
  const { id } = useParams();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let text = "Welcome,";
  let Icon = PiSunDimFill;

  if (hour >= 5 && hour < 12) {
    text = "Good Morning,";
    Icon = PiSunDimFill;
  } else if (hour >= 12 && hour < 17) {
    text = "Good Afternoon,";
    Icon = TbSunset2;
  } else if (hour >= 17 && hour < 22) {
    text = "Good Evening,";
    Icon = TbSunset2;
  } else {
    text = "Good Night,";
    Icon = IoIosMoon;
  }

  const userInitials = user?.fullName?.charAt(0) || "U";

  return (
    <div className={`w-full bg-[var(--sidebar)] h-11 flex text-[var(--sidebar-foreground)] justify-between items-center px-4 md:px-8 border-b border-[var(--border)] font-medium text-sm z-30 relative backdrop-blur-md transition-colors duration-300 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 text-[var(--sidebar-foreground)]">
        <Icon className="text-[var(--primary)] text-lg animate-pulse" />
        <span className="font-semibold text-xs md:text-sm">
          {text} <span className="text-[var(--primary)] font-bold">{user?.fullName || "User"}</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="font-bold text-[10px] md:text-xs uppercase tracking-wider bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full px-2.5 py-0.5 text-[var(--primary)] shadow-sm">
          {workspace?.name || "Workspace"}
        </div>

        {/* User Profile Menu */}
        <div className="relative flex items-center" ref={dropdownRef}>
          <button
            onClick={() => setOpenProfile(!openProfile)}
            className="w-7 h-7 rounded-full flex items-center justify-center border border-white/10 shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer overflow-hidden bg-zinc-950"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="user avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] text-white flex items-center justify-center font-bold text-[11px]">
                {userInitials}
              </div>
            )}
          </button>

          {openProfile && (
            <div className="absolute right-0 top-9 bg-neutral-950 border border-white/10 rounded-2xl w-48 shadow-2xl backdrop-blur-xl z-50 overflow-hidden p-1.5 animate-list-appear flex flex-col gap-1 text-xs">
              <div className="px-3 py-1.5 border-b border-white/5">
                <p className="font-bold text-white truncate">{user?.fullName || "My Profile"}</p>
                {user?.email && (
                  <p className="text-[10px] text-neutral-400 truncate mt-0.5">{user.email}</p>
                )}
              </div>

              <button
                onClick={() => {
                  onOpenSettings("preferences");
                  setOpenProfile(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 hover:text-white transition cursor-pointer flex items-center gap-2.5 font-medium text-neutral-300"
              >
                <Settings size={13} /> Preferences
              </button>

              {isOwner && (
                <button
                  onClick={() => {
                    onOpenSettings("edit");
                    setOpenProfile(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 hover:text-white transition cursor-pointer flex items-center gap-2.5 font-medium text-neutral-300"
                >
                  <Shield size={13} /> Admin Panel
                </button>
              )}

              <button
                onClick={() => {
                  router.push("/login");
                  setOpenProfile(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-red-500 transition cursor-pointer flex items-center gap-2.5 font-medium border-t border-white/5 mt-1"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
