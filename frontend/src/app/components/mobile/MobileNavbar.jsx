"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome } from "react-icons/hi";
import { IoChatbubbleSharp } from "react-icons/io5";
import { MdGroups3 } from "react-icons/md";
import { FaHashtag } from "react-icons/fa6";

export default function MobileNavbar({ id }) {
  const pathname = usePathname();

  const isHome = pathname === `/workspace/${id}`;
  const isChannels = pathname?.startsWith(`/workspace/${id}/channels`);
  const isDMs = pathname?.startsWith(`/workspace/${id}/dm`);
  const isGroups = pathname?.startsWith(`/workspace/${id}/groups`);

  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2.5 md:hidden bg-[#09090b]/80 backdrop-blur-xl text-neutral-400 border-t border-white/5 z-50">
      <Link
        href={`/workspace/${id}`}
        className={`flex flex-col items-center text-[10px] font-semibold tracking-wider transition duration-200 active:scale-95 ${
          isHome ? "text-[color:var(--primary)] scale-105" : "hover:text-white"
        }`}
      >
        <HiHome size={22} className={isHome ? "drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]" : ""} />
        <span className="mt-0.5">Home</span>
      </Link>

      <Link
        href={`/workspace/${id}/channels`}
        className={`flex flex-col items-center text-[10px] font-semibold tracking-wider transition duration-200 active:scale-95 ${
          isChannels ? "text-[color:var(--primary)] scale-105" : "hover:text-white"
        }`}
      >
        <FaHashtag size={20} className={isChannels ? "drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]" : ""} />
        <span className="mt-0.5">Channels</span>
      </Link>

      <Link
        href={`/workspace/${id}/dm`}
        className={`flex flex-col items-center text-[10px] font-semibold tracking-wider transition duration-200 active:scale-95 ${
          isDMs ? "text-[color:var(--primary)] scale-105" : "hover:text-white"
        }`}
      >
        <IoChatbubbleSharp size={20} className={isDMs ? "drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]" : ""} />
        <span className="mt-0.5">Messages</span>
      </Link>

      <Link
        href={`/workspace/${id}/groups`}
        className={`flex flex-col items-center text-[10px] font-semibold tracking-wider transition duration-200 active:scale-95 ${
          isGroups ? "text-[color:var(--primary)] scale-105" : "hover:text-white"
        }`}
      >
        <MdGroups3 size={22} className={isGroups ? "drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]" : ""} />
        <span className="mt-0.5">Groups</span>
      </Link>
    </div>
  );
}
