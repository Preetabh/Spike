import React from "react";

const ChatWelcome = () => {
  return (
    <div className="relative flex-1 flex items-center justify-center px-6 overflow-hidden bg-[color:var(--background)] text-[color:var(--foreground)]">
      {/* Background Floating Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[color:var(--primary)]/10 blur-3xl animate-bg-blob-1"></div>
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-[color:var(--accent)]/10 blur-3xl animate-bg-blob-2"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-xl w-full text-center border border-white/5 bg-zinc-900/50 backdrop-blur-2xl rounded-[32px] px-8 py-14 shadow-2xl animate-glow-3d">
        {/* Floating 3D Logo */}
        <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] mx-auto flex items-center justify-center text-5xl shadow-[0_15px_35px_rgba(168,85,247,0.4)] border border-white/10 animate-float-3d relative group cursor-default select-none">
          💬
          <span className="absolute -inset-1.5 rounded-[32px] bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] opacity-30 blur-md -z-10 group-hover:opacity-50 transition duration-500"></span>
        </div>

        {/* Heading */}
        <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight mt-10 bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
          Welcome to Spike
        </h1>

        {/* Description */}
        <p className="text-neutral-400 mt-5 leading-relaxed text-sm md:text-base max-w-md mx-auto font-medium">
          Select a conversation from the sidebar and start chatting with your
          team in real-time using your beautifully themed workspace.
        </p>

        {/* Button */}
        <button className="mt-10 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--accent)] text-white font-extrabold text-sm tracking-wide transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-95 border border-white/10">
          Start Messaging
        </button>
      </div>
    </div>
  );
};

export default ChatWelcome;
