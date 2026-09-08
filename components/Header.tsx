"use client";

import { BookmarkCheck, Sparkles, Github } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface HeaderProps {
  savedCount: number;
  onOpenLibrary: () => void;
}

export default function Header({ savedCount, onOpenLibrary }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 dark:bg-[#05060f]/90 border-b border-[#E7E2D8] dark:border-white/8 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo and Status */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            {/* Ambient radiant aura in dark mode */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 opacity-0 dark:opacity-80 blur-[9px] group-hover:opacity-100 transition-opacity duration-500" />

            {/* Squircle body with glossy bevel */}
            <div className="relative w-10 h-10 rounded-xl bg-[#121E1B] dark:bg-gradient-to-br dark:from-emerald-400 dark:via-teal-600 dark:to-emerald-800 p-[1px] shadow-md dark:shadow-[0_0_22px_rgba(16,185,129,0.45)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              {/* Inner frosted glass highlight */}
              <div className="w-full h-full rounded-[11px] bg-gradient-to-b from-white/25 via-transparent to-black/20 dark:from-white/30 dark:to-transparent flex items-center justify-center border border-white/20 dark:border-white/30 backdrop-blur-sm">
                <Sparkles
                  size={19}
                  className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] group-hover:rotate-12 transition-transform duration-300"
                  fill="currentColor"
                  fillOpacity={0.25}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-[#121E1B] dark:text-white">
                promptHelper
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF2ED] dark:bg-emerald-500/20 text-[#1B4D3E] dark:text-emerald-400 border border-[#CEE0D5] dark:border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D3E] dark:bg-emerald-400 animate-pulse" />
                Gemini 3.7 Flash
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#121E1B] dark:text-slate-300 block leading-tight font-medium">
              AI-Native Prompt Architect built by{" "}
              <span className="font-bold text-black dark:text-emerald-400 hover:opacity-80 transition-opacity">
                @Techyada21
              </span>
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Library Button */}
          <button
            onClick={onOpenLibrary}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-[#E6E1D7] dark:border-white/10 hover:border-[#121E1B]/30 dark:hover:border-white/20 text-xs font-semibold text-[#14201D] dark:text-slate-200 transition-all shadow-[0_1px_4px_rgba(20,30,25,0.03)]"
            title="Open Saved Prompts Library"
          >
            <BookmarkCheck
              size={15}
              className="text-[#1B4D3E] dark:text-emerald-400"
            />
            <span className="hidden sm:inline">Library</span>
            {savedCount > 0 && (
              <span className="bg-[#121E1B] dark:bg-emerald-500 text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow-sm dark:shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                {savedCount > 99 ? "99+" : savedCount}
              </span>
            )}
          </button>

          {/* GitHub / Showcase link styled like the "Continue with GitHub" pill in the image */}
          <a
            href="https://github.com/yared2124/Prompt-helper"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121E1B] dark:bg-white/10 hover:bg-[#1E332E] dark:hover:bg-white/20 text-white text-xs font-semibold shadow-sm transition-all"
            title="View on GitHub"
          >
            <Github size={15} />
            <span className="hidden md:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
