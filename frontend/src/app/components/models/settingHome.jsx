"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { applyTheme } from "../../../lib/theme";
import EditWorkspace from "../../(protected)/workspace/[id]/settings/editWorkspace.jsx";
import ManageMembers from "../../(protected)/workspace/[id]/settings/manageMembers.jsx";

const mode = ["light", "dark", "system"];

const themes = [
  "iceBlue",
  "forest",
  "sunset",
  "midnight",
  "rose",
  "neon",
  "cosmic",
];

const SettingHome = ({ onClose, initialTab = "preferences" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentMode, setCurrentMode] = useState("dark");
  const [currentTheme, setCurrentTheme] = useState("rose");

  const params = useParams();
  const workspaceId = params?.id;

  const { data: workspace } = useQuery({
    queryKey: ["workspace", workspaceId],
    enabled: !!workspaceId,
  });

  const { data: user } = useQuery({
    queryKey: ["me"],
  });

  const isOwner = workspace?.ownerId === user?.id || workspace?.admin === true;

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    try {
      const m = localStorage.getItem("app-mode") || "dark";
      const t = localStorage.getItem("app-theme") || "rose";
      setCurrentMode(m);
      setCurrentTheme(t);
    } catch {}
  }, []);

  const handleModeChange = async (selectedMode) => {
    try {
      // optimistic UI
      setCurrentMode(selectedMode);
      applyTheme(selectedMode, currentTheme);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/theme`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: selectedMode, theme: currentTheme }),
        }
      );

      const data = await res.json();
      if (data?.status !== "success") throw new Error("Failed");
    } catch (error) {
      console.error("❌ MODE UPDATE ERROR:", error.message);
    }
  };

  const handleThemeChange = async (selectedTheme) => {
    try {
      // optimistic UI
      setCurrentTheme(selectedTheme);
      applyTheme(currentMode, selectedTheme);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/theme`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: selectedTheme, mode: currentMode }),
        }
      );

      const data = await res.json();
      if (data?.status !== "success") throw new Error("Failed");
    } catch (error) {
      console.error("❌ THEME UPDATE ERROR:", error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] flex flex-col bg-[color:var(--card)] text-[color:var(--foreground)] rounded-t-3xl md:rounded-3xl shadow-2xl ring-1 ring-[color:var(--border)] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--accent)] text-[color:var(--primary-foreground)] shadow-md shrink-0">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Workspace Preferences</h2>
          <p className="text-xs sm:text-sm opacity-90 mt-1">
            Customize appearance, themes and manage workspace configurations in real-time.
          </p>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-90 font-bold cursor-pointer text-sm"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Inner layout */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] flex-1 overflow-hidden min-h-0 bg-[color:var(--background)]">
          
          {/* Sidebar Left for PC */}
          <aside className="hidden md:flex flex-col border-r border-[color:var(--border)] p-4 bg-[color:var(--card)]/40 gap-2 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--muted-foreground)] px-3 mb-1">
              Categories
            </div>
            <ul className="space-y-1">
              <li
                onClick={() => setActiveTab("preferences")}
                className={`px-3.5 py-2.5 rounded-xl cursor-pointer text-xs font-semibold tracking-wide transition-all duration-200 ${
                  activeTab === "preferences"
                    ? "bg-[color:var(--primary)]/15 text-[color:var(--primary)] font-extrabold shadow-sm"
                    : "hover:bg-[color:var(--accent)]/5 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                }`}
              >
                Preferences
              </li>
              {isOwner && (
                <>
                  <li
                    onClick={() => setActiveTab("edit")}
                    className={`px-3.5 py-2.5 rounded-xl cursor-pointer text-xs font-semibold tracking-wide transition-all duration-200 ${
                      activeTab === "edit"
                        ? "bg-[color:var(--primary)]/15 text-[color:var(--primary)] font-extrabold shadow-sm"
                        : "hover:bg-[color:var(--accent)]/5 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                    }`}
                  >
                    Workspace Details
                  </li>
                  <li
                    onClick={() => setActiveTab("members")}
                    className={`px-3.5 py-2.5 rounded-xl cursor-pointer text-xs font-semibold tracking-wide transition-all duration-200 ${
                      activeTab === "members"
                        ? "bg-[color:var(--primary)]/15 text-[color:var(--primary)] font-extrabold shadow-sm"
                        : "hover:bg-[color:var(--accent)]/5 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                    }`}
                  >
                    Manage Members
                  </li>
                </>
              )}
            </ul>
          </aside>

          {/* Navigation Bar for Mobile */}
          <div className="md:hidden flex gap-1.5 px-4 pt-4 pb-2 border-b border-[color:var(--border)] overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => setActiveTab("preferences")}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                activeTab === "preferences" ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-md" : "bg-[color:var(--card)] border border-[color:var(--border)] text-[color:var(--muted-foreground)]"
              }`}
            >
              Preferences
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                    activeTab === "edit" ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-md" : "bg-[color:var(--card)] border border-[color:var(--border)] text-[color:var(--muted-foreground)]"
                  }`}
                >
                  Workspace Info
                </button>
                <button
                  onClick={() => setActiveTab("members")}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                    activeTab === "members" ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-md" : "bg-[color:var(--card)] border border-[color:var(--border)] text-[color:var(--muted-foreground)]"
                  }`}
                >
                  Manage Members
                </button>
              </>
            )}
          </div>

          {/* Content Main View */}
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto no-scrollbar min-h-0 bg-[color:var(--background)]">
            {activeTab === "preferences" && (
              <div className="space-y-6 animate-fade-in">
                {/* Mode section */}
                <section className="rounded-2xl border border-[color:var(--border)] p-5 bg-[color:var(--card)]/50 backdrop-blur-md">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[color:var(--muted-foreground)] mb-4">App Mode</h3>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {mode.map((m) => (
                      <button
                        key={m}
                        onClick={() => handleModeChange(m)}
                        className={`px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-xl border text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer ${
                          currentMode === m
                            ? "border-[color:var(--primary)] bg-[color:var(--primary)]/10 text-[color:var(--primary)] shadow-sm"
                            : "border-[color:var(--border)] hover:border-[color:var(--primary)] bg-[color:var(--card)] text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="capitalize">{m}</span>
                          {currentMode === m && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--primary)]" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Theme picker */}
                <section className="rounded-2xl border border-[color:var(--border)] p-5 bg-[color:var(--card)]/50 backdrop-blur-md">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[color:var(--muted-foreground)] mb-4">Theme Picker</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {themes.map((theme) => {
                      const highlight = currentTheme === theme;
                      return (
                        <button
                          key={theme}
                          onClick={() => handleThemeChange(theme)}
                          className={`relative text-left p-3 rounded-xl border transition-all duration-300 active:scale-95 cursor-pointer ${
                            highlight
                              ? "border-[color:var(--primary)] bg-[color:var(--primary)]/10 text-[color:var(--primary)] shadow-sm"
                              : "border-[color:var(--border)] hover:border-[color:var(--primary)] bg-[color:var(--card)] text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`h-3 w-3 rounded-full bg-gradient-to-r ${
                              theme === "iceBlue" ? "from-blue-500 to-sky-400" :
                              theme === "forest" ? "from-green-500 to-emerald-400" :
                              theme === "sunset" ? "from-orange-500 to-amber-400" :
                              theme === "midnight" ? "from-indigo-600 to-purple-500" :
                              theme === "rose" ? "from-pink-500 to-rose-400" :
                              theme === "neon" ? "from-lime-500 to-emerald-400" :
                              "from-purple-600 to-violet-500"
                            }`} />
                            <span className="font-bold text-xs capitalize">{theme}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "edit" && isOwner && workspace && (
              <div className="animate-fade-in">
                <EditWorkspace workspace={workspace} />
              </div>
            )}

            {activeTab === "members" && isOwner && workspace && (
              <div className="animate-fade-in">
                <ManageMembers workspace={workspace} />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingHome;
