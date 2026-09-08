"use client";

import { BookmarkCheck, Github } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface HeaderProps {
  savedCount: number;
  onOpenLibrary: () => void;
}

export default function Header({ savedCount, onOpenLibrary }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 dark:bg-[#05060f]/90 border-b border-[#E7E2D8] dark:border-white/8 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand and Subtitle */}
        <div>
          {/* <div className="flex items-center gap-2">
            <span className="font-black text-lg sm:text-xl tracking-tight text-[#121E1B] dark:text-white">
              prompt Helper
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF2ED] dark:bg-emerald-500/20 text-[#1B4D3E] dark:text-emerald-400 border border-[#CEE0D5] dark:border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D3E] dark:bg-emerald-400 animate-pulse" />
              Gemini 3.7 Flash
            </span>
          </div> */}
            <span className="text-[10px] sm:text-[11px] text-[#121E1B] dark:text-slate-300 block leading-tight font-medium">
              AI-Native Prompt Architect built by{" "}
              <a
                href="https://t.me/Techyada21"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-black dark:text-emerald-400 hover:underline hover:text-[#1A5343] dark:hover:text-emerald-300 transition-colors"
                title="Visit @Techyada21 on Telegram"
              >
                @Techyada21
              </a>
            </span>
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
