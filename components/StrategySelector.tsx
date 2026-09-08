"use client";

import { PromptStrategy } from "@/types";
import { PROMPT_STRATEGIES } from "@/data/aiModels";
import IconRenderer from "@/components/IconRenderer";

interface StrategySelectorProps {
  selectedId: string;
  onSelect: (strategyId: string) => void;
}

export default function StrategySelector({
  selectedId,
  onSelect,
}: StrategySelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Optimization Strategy
        </label>
        <span className="text-[11px] text-indigo-600 dark:text-violet-400 font-medium">
          {PROMPT_STRATEGIES.find((s) => s.id === selectedId)?.benefit}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PROMPT_STRATEGIES.map((strat) => {
          const isSelected = selectedId === strat.id;
          return (
            <button
              key={strat.id}
              type="button"
              onClick={() => onSelect(strat.id)}
              className={`text-left p-2.5 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? "bg-indigo-50 dark:bg-violet-950/40 border-indigo-500/80 dark:border-violet-500/80 shadow-sm shadow-indigo-500/10 text-slate-900 dark:text-white"
                  : "bg-white/40 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 text-slate-600 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <IconRenderer
                  name={strat.iconName}
                  size={14}
                  className={
                    isSelected
                      ? "text-indigo-600 dark:text-violet-400"
                      : "text-slate-400 dark:text-slate-500"
                  }
                />
                <span className="text-xs font-semibold truncate">
                  {strat.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {strat.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
