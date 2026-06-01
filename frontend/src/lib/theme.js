let systemMedia = null;
let systemListener = null;

export function applyTheme(mode = "light", theme = "rose") {
  if (typeof document === "undefined") return; // SSR guard

  const root = document.documentElement;

  // 🔥 Remove old theme classes dynamically
  root.classList.forEach((cls) => {
    if (cls.startsWith("theme-")) {
      root.classList.remove(cls);
    }
  });

  // reset dark mode first
  root.classList.remove("dark");

  // 🔥 Handle mode
  const setDarkClass = (isDark) => {
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  };

  if (mode === "dark") {
    setDarkClass(true);
  } else if (mode === "light") {
    setDarkClass(false);
  } else if (mode === "system") {
    if (typeof window !== "undefined") {
      // cleanup old listener
      if (systemMedia && systemListener) {
        systemMedia.removeEventListener("change", systemListener);
      }

      systemMedia = window.matchMedia("(prefers-color-scheme: dark)");

      setDarkClass(systemMedia.matches);

      systemListener = (e) => setDarkClass(e.matches);
      systemMedia.addEventListener("change", systemListener);
    }
  }

  // cleanup if switching away from system
  if (mode !== "system" && systemMedia && systemListener) {
    systemMedia.removeEventListener("change", systemListener);
    systemMedia = null;
    systemListener = null;
  }

  // 🔥 Apply theme
  if (theme) {
    root.classList.add(`theme-${theme}`);
  }

  // 🔥 Persist user preference
  try {
    localStorage.setItem("app-mode", mode);
    localStorage.setItem("app-theme", theme);
  } catch (e) {
    console.warn("Theme persistence failed");
  }
}

// 🔥 Load saved theme on app start
export function initTheme() {
  if (typeof window === "undefined") return;

  try {
    const savedMode = localStorage.getItem("app-mode") || "light";
    const savedTheme = localStorage.getItem("app-theme") || "rose";

    applyTheme(savedMode, savedTheme);
  } catch (error) {
    console.warn("Theme initialization failed");
  }
}

// 🔥 Apply theme instantly on first load (prevents white flash)
if (typeof window !== "undefined") {
  initTheme();
}
