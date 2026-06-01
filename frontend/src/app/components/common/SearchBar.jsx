

import React from "react";

const SearchBar = ({
  placeholder = "Search conversations...",
  value = "",
  onChange,
  className = "",
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg pointer-events-none">
        🔍
      </div>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-14 rounded-2xl bg-[#1b1b1d] border border-neutral-800 pl-12 pr-14 text-white placeholder:text-neutral-500 outline-none transition-all duration-300 focus:border-green-500/50 focus:shadow-[0_0_20px_rgba(34,197,94,0.08)] hover:border-neutral-700 text-[15px]"
      />

      {/* Shortcut Hint */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-neutral-500">
        <span className="px-2 py-1 rounded-md bg-[#252527] border border-neutral-700 shadow-sm">
          ⌘
        </span>

        <span className="px-2 py-1 rounded-md bg-[#252527] border border-neutral-700 shadow-sm">
          K
        </span>
      </div>
    </div>
  );
};

export default SearchBar;
