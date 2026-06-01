

import React from "react";

const TypingIndicator = ({ users = ["Vishu"] }) => {
  return (
    <div className="px-6 py-3 bg-[#111112] border-t border-neutral-800">
      <div className="flex items-center gap-3">
        {/* Avatar Stack */}
        <div className="flex -space-x-2">
          {users.slice(0, 3).map((user, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded-full bg-green-500 border-2 border-[#111112] flex items-center justify-center text-white text-xs font-semibold shadow-md"
            >
              {user.charAt(0)}
            </div>
          ))}
        </div>

        {/* Typing Bubble */}
        <div className="flex items-center gap-3 bg-[#1f1f20] border border-neutral-800 px-4 py-2 rounded-2xl shadow-lg">
          {/* Animated Dots */}
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce"></span>
          </div>

          {/* Text */}
          <p className="text-sm text-neutral-300">
            <span className="font-medium text-white">
              {users.join(", ")}
            </span>{" "}
            {users.length > 1 ? "are" : "is"} typing...
          </p>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
