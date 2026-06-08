"use client";
import { TbSunset2 } from "react-icons/tb";
import { PiSunDimFill } from "react-icons/pi";
import { IoIosMoon } from "react-icons/io";

export default function TopNavbar({ user, workspace }) {
  const hour = new Date().getHours();

  let text = "Welcome";
  let Icon = PiSunDimFill;


  return (
    <div className="w-full bg-[var(--sidebar)] h-9 flex text-[var(--sidebar-foreground)] justify-between items-center px-4 md:px-16 border-b border-[var(--border)] font-extrabold text-lg">
      <div className="flex text-sm items-center gap-2 text-[var(--primary)]">
        <Icon />
        <span>{text} {user?.fullName || "User"} </span>
      </div>

      <div className="font-semibold text-sm tracking-wide">
        {workspace?.name || "Workspace"}
      </div>
    </div>
  );
}
