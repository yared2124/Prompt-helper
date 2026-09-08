"use client";

import { BookmarkCheck, Sparkles, Github, ExternalLink } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface HeaderProps {
  savedCount: number;
  onOpenLibrary: () => void;
}

export default function Header({ savedCount, onOpenLibrary }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass-card border-b border-slate-200/80 dark:border-white/8 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo and Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                PromptHelper
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Gemini 3.7 Flash
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
              AI-Native Prompt Architect
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
            className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card glass-card-hover border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all"
            title="Open Saved Prompts Library"
          >
            <BookmarkCheck size={16} className="text-indigo-600 dark:text-violet-400" />
            <span className="hidden sm:inline">Library</span>
            {savedCount > 0 && (
              <span className="bg-indigo-600 dark:bg-violet-600 text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                {savedCount > 99 ? "99+" : savedCount}
              </span>
            )}
          </button>

          {/* GitHub / Showcase link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl glass-card glass-card-hover border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="View on GitHub"
          >
            <Github size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}
