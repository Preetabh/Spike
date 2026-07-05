import React from "react";

const Avatar = ({
  name = "User",
  src,
  size = "md",
  status = false,
  type = "dm",
}) => {
  const sizeClasses = {
    sm: "w-9 h-9 text-xs rounded-xl",
    md: "w-11 h-11 text-sm rounded-2xl",
    lg: "w-14 h-14 text-lg rounded-[18px]",
    xl: "w-20 h-20 text-2xl rounded-3xl",
  };

  const typeGradient = {
    dm: "from-purple-500/80 to-pink-500/80",
    group: "from-amber-400 to-orange-500",
    channel: "from-blue-500 to-purple-600",
  };

  // Safe avatar initials
  const initials = type === "channel"
    ? "#"
    : name?.replace(/^[👥#\s]*/g, "").charAt(0) || "U";

  return (
    <div className="relative inline-flex flex-shrink-0 group">
      {/* Avatar Container */}
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} object-cover border border-white/10 shadow-lg transition-transform duration-300 group-hover:scale-105`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} bg-gradient-to-br ${typeGradient[type]} flex items-center justify-center text-white font-extrabold uppercase shadow-lg select-none border border-white/10 transition-transform duration-300 group-hover:scale-105`}
        >
          {initials}
        </div>
      )}

      {/* Pulsing Online Status Indicator */}
      {status && (
        <span className="absolute bottom-[-1px] right-[-1px] flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-[#09090b]"></span>
        </span>
      )}
    </div>
  );
};

export default Avatar;
