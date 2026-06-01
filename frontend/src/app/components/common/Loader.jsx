

import React from "react";

const Loader = ({
  text = "Loading...",
  fullScreen = false,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-[3px]",
    lg: "w-16 h-16 border-4",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 ${
        fullScreen
          ? "fixed inset-0 bg-[#0f0f10]/95 backdrop-blur-xl z-[9999]"
          : "w-full h-full py-20"
      }`}
    >
      {/* Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Outer Glow */}
        <div className="absolute w-24 h-24 rounded-full bg-green-500/10 blur-2xl"></div>

        {/* Spinner */}
        <div
          className={`${sizeClasses[size]} rounded-full border-green-500 border-t-transparent animate-spin shadow-lg shadow-green-500/20`}
        ></div>
      </div>

      {/* Text */}
      <div className="text-center">
        <h2 className="text-white text-lg font-semibold tracking-wide">
          {text}
        </h2>

        <p className="text-neutral-500 text-sm mt-1">
          Please wait a moment
        </p>
      </div>

      {/* Animated Dots */}
      <div className="flex items-center gap-2 mt-1">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce"></span>
      </div>
    </div>
  );
};

export default Loader;
