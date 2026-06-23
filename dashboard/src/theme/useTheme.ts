import { create } from "zustand";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* ignore storage failures */
  }
}

function initialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

/**
 * Single source of truth for the theme. Shared across every consumer (toggle, charts,
 * map) so a manual switch re-renders all of them — without this, charts read stale
 * color tokens from load time. The initial class is set by an inline script in
 * index.html (no flash); this store keeps React in sync and persists the choice.
 */
export const useTheme = create<ThemeState>((set, get) => ({
  theme: initialTheme(),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggle: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
  },
}));

// Follow OS changes only while the user hasn't made an explicit choice.
if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (localStorage.getItem("theme")) return;
    useTheme.getState().setTheme(e.matches ? "dark" : "light");
  });
}
