"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("prompthelper_theme") as "dark" | "light" | null;
    if (stored) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // First-time visitors: default to light mode
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("prompthelper_theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl glass-card flex items-center justify-center opacity-0" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="relative p-2 rounded-xl bg-white dark:bg-white/5 border border-[#E6E1D7] dark:border-white/10 text-[#121E1B] dark:text-gray-300 hover:border-[#121E1B]/30 dark:hover:text-emerald-400 transition-colors flex items-center justify-center group shadow-[0_1px_4px_rgba(20,30,25,0.03)]"
    >
      {theme === "dark" ? (
        <Sun size={17} className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon size={17} className="text-[#121E1B] group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
