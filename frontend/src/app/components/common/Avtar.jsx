

import React from "react";

const Avatar = ({
  name = "User",
  src,
  size = "md",
  status = false,
  type = "dm",
}) => {
  const sizeClasses = {
    sm: "w-9 h-9 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
  };

  const typeGradient = {
    dm: "from-green-500 to-emerald-500",
    group: "from-purple-500 to-pink-500",
    channel: "from-blue-500 to-cyan-500",
  };

  return (
    <div className="relative inline-flex flex-shrink-0">
      {/* Avatar */}
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} rounded-2xl object-cover border border-neutral-800 shadow-xl`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${typeGradient[type]} flex items-center justify-center text-white font-bold uppercase shadow-xl select-none`}
        >
          {type === "channel"
            ? "#"
            : name?.charAt(0)}
        </div>
      )}

      {/* Online Status */}
      {status && (
        <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-[#111112] shadow-md"></span>
      )}
    </div>
  );
};

export default Avatar;
