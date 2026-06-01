"use client";

import { useEffect, useState } from "react";
import { applyTheme } from "../../../lib/theme";

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

const SettingHome = ({ onClose }) => {
  const [currentMode, setCurrentMode] = useState("dark");
  const [currentTheme, setCurrentTheme] = useState("rose");

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
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-2 sm:p-4">
      <div className="w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto bg-[color:var(--card)] text-[color:var(--foreground)] no-scrollbar rounded-t-2xl md:rounded-2xl shadow-2xl ring-1 ring-[color:var(--border)] scroll-smooth">
        <div className="relative p-4 sm:p-6 bg-[color:var(--primary)] text-[color:var(--primary-foreground)]">
          <h2 className="text-2xl font-bold">Workspace Settings</h2>
          <p className="text-sm opacity-90 mt-1">
            Customize mode, theme and preview style immediately.
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/35 transition"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4">
          <aside className="hidden md:block border-r border-[color:var(--border)] p-4 bg-[color:var(--background)]">
            <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)] mb-3">
              Categories
            </div>
            <ul className="space-y-2">
              <li className="px-3 py-2 rounded-lg bg-[color:var(--accent)]/15 text-[color:var(--primary)] font-medium">
                Preferences
              </li>
              <li className="px-3 py-2 rounded-lg hover:bg-[color:var(--accent)]/10">
                Notifications
              </li>
              <li className="px-3 py-2 rounded-lg hover:bg-[color:var(--accent)]/10">
                Privacy
              </li>
            </ul>
          </aside>

          <div className="md:hidden flex gap-2 px-4 pt-4">
            <button className="flex-1 px-3 py-2 rounded-lg bg-[color:var(--accent)]/20">Preferences</button>
            <button className="flex-1 px-3 py-2 rounded-lg bg-[color:var(--accent)]/10">Notifications</button>
            <button className="flex-1 px-3 py-2 rounded-lg bg-[color:var(--accent)]/10">Privacy</button>
          </div>
          <main className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            <section className="rounded-xl border border-[color:var(--border)] p-5 bg-[color:var(--background)]">
              <h3 className="font-semibold text-lg mb-3">App Mode</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {mode.map((m) => (
                  <button
                    key={m}
                    onClick={() => handleModeChange(m)}
                    className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl border transition-all duration-200 ${
                      currentMode === m
                        ? "border-[color:var(--primary)] bg-[color:var(--accent)]/30 shadow-sm"
                        : "border-[color:var(--border)] hover:border-[color:var(--primary)] hover:bg-[color:var(--accent)]/12"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="capitalize">{m}</span>
                      {currentMode === m && (
                        <span className="text-xs text-[color:var(--primary)]">Active</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[color:var(--border)] p-5 bg-[color:var(--background)]">
              <h3 className="font-semibold text-lg mb-3">Theme Picker</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {themes.map((theme) => {
                  const highlight = currentTheme === theme;
                  return (
                    <button
                      key={theme}
                      onClick={() => handleThemeChange(theme)}
                      className={`relative text-left p-2 sm:p-3 rounded-xl border transition-all duration-200 ${
                        highlight
                          ? "border-[color:var(--primary)] bg-[color:var(--accent)]/30 shadow-sm"
                          : "border-[color:var(--border)] hover:border-[color:var(--primary)] hover:bg-[color:var(--accent)]/12"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" />
                        <span className="font-medium capitalize">{theme}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-[color:var(--border)]">
                        <div
                          className={`h-full rounded-full ${
                            theme === "iceBlue"
                              ? "bg-sky-400"
                              : theme === "forest"
                              ? "bg-green-500"
                              : theme === "sunset"
                              ? "bg-orange-500"
                              : theme === "midnight"
                              ? "bg-indigo-500"
                              : theme === "rose"
                              ? "bg-pink-500"
                              : theme === "neon"
                              ? "bg-lime-400"
                              : "bg-violet-500"
                          }`}
                        />
                      </div>
                      {highlight && (
                        <span className="absolute top-2 right-2 text-xs text-[color:var(--primary)] font-bold">
                          ✔
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingHome;
