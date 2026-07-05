"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-[#f4f4f5] overflow-x-hidden relative font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[150px]"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/10 blur-[150px]"></div>
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none z-0"></div>

      {/* NAVBAR */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-purple-500/20">
            S
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Spike
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/login")}
            className="text-neutral-400 hover:text-white font-medium text-sm transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/login")}
            className="bg-white text-black hover:bg-neutral-200 px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg hover:shadow-white/10 active:scale-95 transform"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-28 text-center flex flex-col items-center">
        {/* Sub-badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-xs font-medium mb-8 backdrop-blur-sm">
          <span>✨</span> Introducing Spike 2.0 with Realtime WebSockets
        </div>

        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight max-w-4xl">
          Made for people. <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400 bg-clip-text text-transparent">
            Built for productivity.
          </span>
        </h2>
        <p className="max-w-2xl text-lg md:text-xl text-neutral-400 mb-12 leading-relaxed">
          Connect your team, automate discussions, and collaborate instantly in a gorgeous, customizable workspace design.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => router.push("/login")}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-xl hover:shadow-purple-500/20 transition duration-200 active:scale-98 transform"
          >
            Get Started Free
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full sm:w-auto border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 text-white px-8 py-4 rounded-2xl text-lg font-bold transition duration-200"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16 grid md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md hover:border-purple-500/25 transition duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-xl font-bold mb-6 group-hover:scale-110 transition duration-300">
            💬
          </div>
          <h3 className="text-xl font-bold mb-4 group-hover:text-purple-400 transition-colors">
            Realtime Socket Chats
          </h3>
          <p className="text-neutral-400 leading-relaxed">
            Instant messaging, group chats, public channels, and typing indicators running live on Socket.IO web connections.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md hover:border-pink-500/25 transition duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400 text-xl font-bold mb-6 group-hover:scale-110 transition duration-300">
            🎨
          </div>
          <h3 className="text-xl font-bold mb-4 group-hover:text-pink-400 transition-colors">
            Flexible Design Themes
          </h3>
          <p className="text-neutral-400 leading-relaxed">
            Switch between rose, forest, cosmic, ice-blue, and sunset color schemes with built-in dark and light options.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md hover:border-amber-500/25 transition duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 text-xl font-bold mb-6 group-hover:scale-110 transition duration-300">
            🔒
          </div>
          <h3 className="text-xl font-bold mb-4 group-hover:text-amber-400 transition-colors">
            JWT OTP Verification
          </h3>
          <p className="text-neutral-400 leading-relaxed">
            Safe, passwordless OTP authentication via email to guarantee only verified team members can join workspaces.
          </p>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 my-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-[40px] blur-xl pointer-events-none"></div>
        <div className="relative border border-neutral-900 bg-neutral-950/60 p-12 md:p-20 rounded-[40px] backdrop-blur-md overflow-hidden">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Ready to upgrade your workspace?
          </h2>
          <p className="mb-10 text-neutral-400 text-lg max-w-xl mx-auto">
            Join other productive developers and teams utilizing Spike to get work done together.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-white text-black hover:bg-neutral-200 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-white/10 transition active:scale-95 transform"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-neutral-500 text-sm">
        <div>© {new Date().getFullYear()} Spike. All rights reserved.</div>
        <div>Built with React & Next.js by Vishu 🚀</div>
      </footer>
    </div>
  );
};

export default Page;
