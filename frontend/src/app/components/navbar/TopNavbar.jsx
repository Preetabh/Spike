"use client";
import { TbSunset2 } from "react-icons/tb";
import { PiSunDimFill } from "react-icons/pi";
import { IoIosMoon } from "react-icons/io";

export default function TopNavbar({ user, workspace }) {
  const hour = new Date().getHours();

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

  return (
    <div className="w-full bg-neutral-950/80 h-11 flex text-neutral-300 justify-between items-center px-6 md:px-8 border-b border-white/5 font-medium text-sm z-30 relative backdrop-blur-xl">
      <div className="flex items-center gap-2 text-neutral-200">
        <Icon className="text-purple-400 text-lg animate-pulse" />
        <span className="font-semibold">{text} <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{user?.fullName || "User"}</span></span>
      </div>

      <div className="font-bold text-xs uppercase tracking-wider bg-white/5 border border-white/10 rounded-full px-3 py-1 text-white shadow-inner">
        {workspace?.name || "Workspace"}
      </div>
    </div>
  );
}
