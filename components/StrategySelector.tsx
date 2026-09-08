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
        <label className="text-xs font-semibold uppercase tracking-wider text-[#758480] dark:text-slate-400">
          Optimization Strategy
        </label>
        <span className="text-[11px] text-[#1B4D3E] dark:text-violet-400 font-semibold">
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
                  ? "bg-[#F6F3EC] dark:bg-violet-950/40 border-[#121E1B] dark:border-violet-500/80 shadow-sm text-[#121E1B] dark:text-white"
                  : "bg-white dark:bg-white/[0.02] border-[#E7E2D8] dark:border-white/5 hover:border-[#121E1B]/30 dark:hover:border-white/15 text-[#4E5C58] dark:text-slate-300 shadow-[0_1px_4px_rgba(20,30,25,0.02)]"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <IconRenderer
                  name={strat.iconName}
                  size={14}
                  className={
                    isSelected
                      ? "text-[#121E1B] dark:text-violet-400"
                      : "text-[#879692] dark:text-slate-500"
                  }
                />
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
