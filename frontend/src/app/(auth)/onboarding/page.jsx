"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import CreateWorkspace from "../../components/CreateWorkspace";
import { Sparkles, ArrowRight } from "lucide-react";

const Onboarding = () => {
  const router = useRouter();

  const [workspaceId, setWorkspaceId] = useState("");
  const [admin, setAdmin] = useState("");

  const fetchWorkspaces = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspaces`,
      {
        credentials: "include",
      }
    );

    const data = await res.json();
    setAdmin(data?.admin || "");

    return Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : [];
  };

  const {
    data: workspaces = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-neutral-400">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-semibold tracking-wider mt-4 animate-pulse">Loading workspaces...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-red-500 font-bold">
        Error loading workspaces. Please reload the page.
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white flex items-center justify-center relative overflow-hidden py-10 px-4 md:px-10">
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px] animate-bg-blob-1"></div>
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-pink-500/10 blur-[120px] animate-bg-blob-2"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Side: 3D Animated Hero Segment */}
        <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left select-none max-w-xl mx-auto lg:mx-0">
          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center gap-1.5 animate-pulse">
              <Sparkles size={11} /> Enterprise Collaboration Portal
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-neutral-100 to-neutral-500 bg-clip-text text-transparent">
            Next-Gen Teamwork Portal
          </h1>

          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Collaborate instantly using direct channels, dynamic workspace subgroups, and voice calls. Powered by high-speed server infrastructure and state-of-the-art encryption.
          </p>

          {/* 3D Mockup Container */}
          <div className="relative mt-4 mx-auto lg:mx-0 w-full max-w-sm aspect-[4/3] rounded-3xl border border-white/5 bg-zinc-950/40 backdrop-blur-2xl shadow-2xl animate-float-3d flex items-center justify-center p-6">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/5 pointer-events-none"></div>
            
            {/* Visual elements mapping 3D workspace features */}
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-950/80 border border-white/5 shadow-md">
                <span className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl">💬</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white"># design-feedback</p>
                  <p className="text-[10px] text-neutral-400 truncate">Vishu uploaded logo layout mockups</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-950/80 border border-white/5 shadow-md ml-8">
                <span className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-xl">📞</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white">Voice Call Completed</p>
                  <p className="text-[10px] text-neutral-400 truncate">Duration: 4m 32s</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-950/80 border border-white/5 shadow-md">
                <span className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-xl">👥</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white">Development Group</p>
                  <p className="text-[10px] text-neutral-400 truncate">12 active engineers online</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Workspace Switcher Selection */}
        <div className="lg:col-span-6 w-full max-w-lg mx-auto">
          <div className="border border-white/5 bg-zinc-900/40 backdrop-blur-2xl rounded-[32px] p-6 sm:p-10 shadow-2xl flex flex-col gap-6 animate-glow-3d">
            
            {/* Header branding */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-3xl font-extrabold shadow-lg border border-white/10 mb-4 select-none animate-float-3d">
                💬
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Welcome back!
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Choose a workspace to launch your workspace dashboard.
              </p>
            </div>

            {/* Workspaces List container */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Available Workspaces</span>
                {admin && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-zinc-950/80 border border-white/5 text-purple-400 truncate max-w-[200px]">
                    {admin}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto no-scrollbar pr-0.5">
                {workspaces.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-zinc-950/30 text-neutral-500 text-xs">
                    No workspaces found. Create a new one below to get started!
                  </div>
                ) : (
                  workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setWorkspaceId(ws.id);
                        router.push(`/workspace/${ws.id}`);
                      }}
                      className="w-full flex items-center justify-between p-4 border border-white/5 hover:border-purple-500/30 bg-zinc-950/50 hover:bg-zinc-950/90 rounded-2xl text-left transition duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group shadow-inner"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 group-hover:border-purple-500 flex items-center justify-center font-bold text-purple-400 text-sm transition">
                          {ws.logo ? (
                            <img
                              src={ws.logo}
                              alt="workspace logo"
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            ws.name?.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                            {ws.name}
                          </p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            👥 {ws.members?.length || 1} Members
                          </p>
                        </div>
                      </div>

                      <span className="text-neutral-500 group-hover:text-purple-400 text-sm font-black transition-colors transform group-hover:translate-x-1 duration-300 flex items-center gap-1">
                        Launch <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-white/5 w-full"></div>

            {/* Create workspace entry */}
            <div className="w-full">
              <CreateWorkspace />
            </div>
          </div>
        </div>

      </div>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Onboarding;
