"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

// Sidebar dark-mode switcher — kept outside AppButton since it's a bespoke
// pill toggle, not one of AppButton's semantic variants.
export default function ThemeToggleOS() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex shrink-0 items-center rounded-full bg-sb-item-hover p-1 transition-colors"
      aria-label="Toggle dark mode"
      suppressHydrationWarning
    >
      <div className="absolute left-1 size-6 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-in-out dark:translate-x-6 dark:bg-white/10 dark:shadow-none" />
      <span className="relative flex size-6 items-center justify-center">
        <Sun size={12} className="text-sb-text" />
      </span>
      <span className="relative flex size-6 items-center justify-center">
        <Moon size={12} className="text-sb-text" />
      </span>
    </button>
  );
}
