"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

const CreateWorkspace = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspaces`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Error creating workspace");
        setLoading(false);
        return;
      }

      toast.success("Workspace created successfully!");
      setOpen(false);
      setName("");
      setLoading(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-6">
      <div className="w-full rounded-3xl p-6 flex flex-col gap-5 border border-white/5 bg-zinc-900/40 backdrop-blur-xl shadow-2xl transition duration-300">
        
        {/* Top Info Banner */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full bg-zinc-950/60 p-5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-2xl shadow-lg border border-white/10 shrink-0">
              🚀
            </div>

            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-bold text-neutral-200">
                Create a new Workspace?
              </p>

              <p className="text-xs text-neutral-400 leading-relaxed max-w-[200px] sm:max-w-xs">
                Build a dedicated workspace for your team or project group.
              </p>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => setOpen(true)}
            className="w-full sm:w-auto ml-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all duration-200 whitespace-nowrap cursor-pointer border border-white/10"
          >
            Create Workspace
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-neutral-400">
          <p className="mb-1.5 font-medium">Not seeing your workspace?</p>
          <Link
            href="/login"
            className="text-purple-400 font-bold hover:underline"
          >
            Try a different email address
          </Link>
        </div>
      </div>

      {/* POPUP MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 md:px-10 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-zinc-950/90 border border-white/10 rounded-3xl p-6 sm:p-10 flex flex-col gap-6 relative shadow-2xl animate-glow-3d">
            
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm transition text-neutral-400 cursor-pointer"
            >
              ✕
            </button>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Spike Platform</span>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                What is your workspace name?
              </h1>
              <p className="text-neutral-400 text-xs md:text-sm">
                This will be the title of your organization. Choose something simple that your team will easily recognize.
              </p>
            </div>

            <input
              type="text"
              placeholder="Ex: Acme Corp, Design Team, Dev Squad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-white/10 bg-zinc-900/60 px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 text-white shadow-sm text-sm"
              autoFocus
            />

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => setOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-white/5 bg-transparent hover:bg-white/5 text-xs font-bold text-neutral-300 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition border border-white/10 shadow-lg cursor-pointer ${
                  name.trim()
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
                    : "bg-zinc-900 text-neutral-600 cursor-not-allowed border-transparent"
                }`}
              >
                {loading ? "Creating..." : "Create Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateWorkspace;
