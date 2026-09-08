"use client";

import { PromptStrategy } from "@/types";
import { PROMPT_STRATEGIES } from "@/data/aiModels";
import IconRenderer from "@/components/IconRenderer";

interface StrategySelectorProps {
  selectedId: string;
  onSelect: (strategyId: string) => void;
}

const STRATEGY_THEMES: Record<
  string,
  {
    darkText: string;
    darkBg: string;
    darkBorder: string;
    glow: string;
  }
> = {
  balanced: {
    darkText: "dark:text-amber-400",
    darkBg: "dark:bg-amber-500/15",
    darkBorder: "dark:border-amber-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(245,158,11,0.2)] dark:border-amber-500/50",
  },
  tokensaver: {
    darkText: "dark:text-emerald-400",
    darkBg: "dark:bg-emerald-500/15",
    darkBorder: "dark:border-emerald-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(16,185,129,0.2)] dark:border-emerald-500/50",
  },
  production: {
    darkText: "dark:text-sky-400",
    darkBg: "dark:bg-sky-500/15",
    darkBorder: "dark:border-sky-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(56,189,248,0.2)] dark:border-sky-500/50",
  },
  reasoning: {
    darkText: "dark:text-purple-400",
    darkBg: "dark:bg-purple-500/15",
    darkBorder: "dark:border-purple-500/30",
    glow: "dark:shadow-[0_0_14px_rgba(168,85,247,0.2)] dark:border-purple-500/50",
  },
};

export default function StrategySelector({
  selectedId,
  onSelect,
}: StrategySelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#758480] dark:text-slate-400">
          Optimization Strategy
        </label>
        <span className="text-[11px] text-[#1B4D3E] dark:text-emerald-400 font-semibold">
          {PROMPT_STRATEGIES.find((s) => s.id === selectedId)?.benefit}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PROMPT_STRATEGIES.map((strat) => {
          const isSelected = selectedId === strat.id;
          const theme = STRATEGY_THEMES[strat.id] || {
            darkText: "dark:text-violet-400",
            darkBg: "dark:bg-violet-500/15",
            darkBorder: "dark:border-violet-500/30",
            glow: "dark:shadow-[0_0_14px_rgba(139,92,246,0.2)] dark:border-violet-500/50",
          };

          return (
            <button
              key={strat.id}
              type="button"
              onClick={() => onSelect(strat.id)}
              className={`text-left p-2.5 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? `bg-[#F6F3EC] dark:bg-white/[0.04] border-[#121E1B] shadow-sm text-[#121E1B] dark:text-white ${theme.glow}`
                  : "bg-white dark:bg-white/[0.02] border-[#E7E2D8] dark:border-white/5 hover:border-[#121E1B]/30 dark:hover:border-white/15 text-[#4E5C58] dark:text-slate-300 shadow-[0_1px_4px_rgba(20,30,25,0.02)]"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                    isSelected
                      ? `bg-[#121E1B] text-white dark:text-white ${theme.darkBg} ${theme.darkText} dark:border ${theme.darkBorder}`
                      : `${theme.darkBg} ${theme.darkText} dark:border ${theme.darkBorder}`
                  }`}
                >
                  <IconRenderer
                    name={strat.iconName}
                    size={12}
                    className={
                      isSelected
                        ? "text-white"
                        : "text-[#121E1B]"
                    }
                  />
                </div>
                <span className="text-xs font-bold truncate">
                  {strat.name}
                </span>
              </div>
              <p className="text-[11px] text-[#6E7D79] dark:text-slate-400 line-clamp-2 leading-relaxed">
                {strat.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
