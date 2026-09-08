"use client";

import { Domain } from "@/types";
import IconRenderer from "@/components/IconRenderer";

interface DomainSelectorProps {
  domains: Domain[];
  selected: Domain | null;
  onSelect: (domain: Domain) => void;
  onSelectExample?: (example: string) => void;
}

const DOMAIN_THEMES: Record<
  string,
  {
    darkText: string;
    darkBg: string;
    darkBorder: string;
    glow: string;
  }
> = {
  coding: {
    darkText: "dark:text-sky-400",
    darkBg: "dark:bg-sky-500/15",
    darkBorder: "dark:border-sky-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(56,189,248,0.2)] dark:border-sky-500/50",
  },
  education: {
    darkText: "dark:text-emerald-400",
    darkBg: "dark:bg-emerald-500/15",
    darkBorder: "dark:border-emerald-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(16,185,129,0.2)] dark:border-emerald-500/50",
  },
  writing: {
    darkText: "dark:text-purple-400",
    darkBg: "dark:bg-purple-500/15",
    darkBorder: "dark:border-purple-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(168,85,247,0.2)] dark:border-purple-500/50",
  },
  research: {
    darkText: "dark:text-amber-400",
    darkBg: "dark:bg-amber-500/15",
    darkBorder: "dark:border-amber-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(245,158,11,0.2)] dark:border-amber-500/50",
  },
  business: {
    darkText: "dark:text-blue-400",
    darkBg: "dark:bg-blue-500/15",
    darkBorder: "dark:border-blue-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(59,130,246,0.2)] dark:border-blue-500/50",
  },
  art: {
    darkText: "dark:text-pink-400",
    darkBg: "dark:bg-pink-500/15",
    darkBorder: "dark:border-pink-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(244,114,182,0.2)] dark:border-pink-500/50",
  },
  data: {
    darkText: "dark:text-teal-400",
    darkBg: "dark:bg-teal-500/15",
    darkBorder: "dark:border-teal-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(20,184,166,0.2)] dark:border-teal-500/50",
  },
  ai: {
    darkText: "dark:text-violet-400",
    darkBg: "dark:bg-violet-500/15",
    darkBorder: "dark:border-violet-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(139,92,246,0.2)] dark:border-violet-500/50",
  },
  health: {
    darkText: "dark:text-rose-400",
    darkBg: "dark:bg-rose-500/15",
    darkBorder: "dark:border-rose-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(244,63,94,0.2)] dark:border-rose-500/50",
  },
  language: {
    darkText: "dark:text-lime-400",
    darkBg: "dark:bg-lime-500/15",
    darkBorder: "dark:border-lime-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(163,230,53,0.2)] dark:border-lime-500/50",
  },
  legal: {
    darkText: "dark:text-indigo-400",
    darkBg: "dark:bg-indigo-500/15",
    darkBorder: "dark:border-indigo-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(99,102,241,0.2)] dark:border-indigo-500/50",
  },
  productivity: {
    darkText: "dark:text-orange-400",
    darkBg: "dark:bg-orange-500/15",
    darkBorder: "dark:border-orange-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(249,115,22,0.2)] dark:border-orange-500/50",
  },
};

export default function DomainSelector({
  domains,
  selected,
  onSelect,
  onSelectExample,
}: DomainSelectorProps) {
  const activeTheme = selected ? DOMAIN_THEMES[selected.id] : null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-[#121E1B] dark:text-white flex items-center gap-2 font-serif">
          <span className="w-6 h-6 rounded-lg bg-[#121E1B] dark:bg-gradient-to-tr dark:from-emerald-600 dark:to-teal-500 text-white flex items-center justify-center text-xs font-sans font-bold shadow-sm">
            2
          </span>
          Domain & Context
        </h2>
        <p className="text-xs text-[#717E7A] dark:text-slate-400 mt-0.5">
          Select domain context for domain-specific terminology, schemas, and best practices.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {domains.map((domain) => {
          const isSelected = selected?.id === domain.id;
          const theme = DOMAIN_THEMES[domain.id] || {
            darkText: "dark:text-emerald-400",
            darkBg: "dark:bg-emerald-500/15",
            darkBorder: "dark:border-emerald-500/30",
            glow: "dark:shadow-[0_0_14px_rgba(16,185,129,0.2)] dark:border-emerald-500/50",
          };

          return (
            <button
              key={domain.id}
              onClick={() => onSelect(domain)}
              className={`text-left p-2.5 rounded-xl border transition-all duration-200 group ${
                isSelected
                  ? `bg-[#F6F3EC] dark:bg-white/[0.04] border-[#121E1B] shadow-sm scale-[1.02] ${theme.glow}`
                  : "bg-white dark:bg-white/[0.02] border-[#E7E2D8] dark:border-white/5 hover:border-[#121E1B]/30 dark:hover:border-white/15 hover:scale-[1.01] shadow-[0_2px_8px_-2px_rgba(20,30,25,0.03)]"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 transition-all ${
                  isSelected
                    ? `bg-[#121E1B] text-white shadow-sm dark:shadow-[0_0_10px_rgba(255,255,255,0.15)] ${theme.darkBg} ${theme.darkText} dark:border ${theme.darkBorder}`
                    : `bg-[#F4EFE6] text-[#14201D] group-hover:bg-[#EAE4D8] ${theme.darkBg} ${theme.darkText} dark:border ${theme.darkBorder}`
                }`}
              >
                <IconRenderer name={domain.iconName} size={15} />
              </div>
              <div
                className={`text-xs font-bold truncate ${
                  isSelected
                    ? "text-[#121E1B] dark:text-white"
                    : "text-[#1B2925] dark:text-slate-200"
                }`}
              >
                {domain.name}
              </div>
              <div className="text-[10px] text-[#717E7A] dark:text-slate-400 truncate mt-0.5">
                {domain.description}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-[#E7E2D8] dark:border-white/10 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_2px_10px_-2px_rgba(20,30,25,0.03)]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg bg-[#121E1B] text-white flex items-center justify-center shadow-sm ${
                activeTheme
                  ? `${activeTheme.darkBg} ${activeTheme.darkText} dark:border ${activeTheme.darkBorder} dark:shadow-[0_0_12px_rgba(255,255,255,0.05)]`
                  : "dark:bg-emerald-500/20 dark:text-emerald-400"
              }`}
            >
              <IconRenderer name={selected.iconName} size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-[#121E1B] dark:text-white">
                {selected.name}
              </span>
              <span className="text-[11px] text-[#717E7A] dark:text-slate-400 block">
                {selected.description}
              </span>
            </div>
          </div>

          {/* Clickable Quick Prompts */}
          {selected.examples && onSelectExample && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-[#869591]">
                Quick ideas:
              </span>
              {selected.examples.slice(0, 2).map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectExample(ex)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-white/5 hover:bg-[#F2ECE1] dark:hover:bg-violet-950/30 border border-[#E7E2D8] dark:border-white/10 text-[#44524E] dark:text-slate-300 hover:text-[#121E1B] dark:hover:text-violet-300 transition-colors font-medium"
                >
                  &ldquo;{ex}&rdquo;
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
