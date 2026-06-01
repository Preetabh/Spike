"use client";
import Link from "next/link";
import { HiHome } from "react-icons/hi";
import { IoChatbubbleSharp } from "react-icons/io5";
import { MdGroups3 } from "react-icons/md";
import { FaHashtag } from "react-icons/fa6";

export default function MobileNavbar({ id }) {
  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 md:hidden bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-t border-[var(--border)] z-50">
      <Link href={`/workspace/${id}`} className="flex flex-col items-center text-xs hover:text-[var(--primary)] transition">
        <HiHome size={22} />
        <span>Home</span>
      </Link>
      <Link href={`/workspace/${id}/channels`} className="flex flex-col items-center text-xs hover:text-[var(--primary)] transition">
        <FaHashtag size={22} />
        <span>Channels</span>
      </Link>
      <Link href={`/workspace/${id}/messages`} className="flex flex-col items-center text-xs hover:text-[var(--primary)] transition">
        <IoChatbubbleSharp size={22} />
        <span>Messages</span>
      </Link>
      <Link href={`/workspace/${id}/groups`} className="flex flex-col items-center text-xs hover:text-[var(--primary)] transition">
        <MdGroups3 size={22} />
        <span>Groups</span>
      </Link>
    </div>
  );
}
