"use client";

import { Domain } from "@/types";
import IconRenderer from "@/components/IconRenderer";

interface DomainSelectorProps {
  domains: Domain[];
  selected: Domain | null;
  onSelect: (domain: Domain) => void;
  onSelectExample?: (example: string) => void;
}

export default function DomainSelector({
  domains,
  selected,
  onSelect,
  onSelectExample,
}: DomainSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 dark:bg-violet-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            2
          </span>
          Domain & Context
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Select domain context for domain-specific terminology, schemas, and best practices.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {domains.map((domain) => {
          const isSelected = selected?.id === domain.id;
          return (
            <button
              key={domain.id}
              onClick={() => onSelect(domain)}
              className={`text-left p-2.5 rounded-xl border transition-all duration-200 group ${
                isSelected
                  ? "bg-indigo-50/90 dark:bg-violet-950/40 border-indigo-500 dark:border-violet-500 shadow-sm scale-[1.02]"
                  : "bg-white/70 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 hover:scale-[1.01]"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-violet-400"
                }`}
              >
                <IconRenderer name={domain.iconName} size={15} />
              </div>
              <div
                className={`text-xs font-bold truncate ${
                  isSelected
                    ? "text-indigo-700 dark:text-violet-300"
                    : "text-slate-800 dark:text-slate-200"
                }`}
              >
                {domain.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {domain.description}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <IconRenderer name={selected.iconName} size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {selected.name}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                {selected.description}
              </span>
            </div>
          </div>

          {/* Clickable Quick Prompts */}
          {selected.examples && onSelectExample && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Quick ideas:
              </span>
              {selected.examples.slice(0, 2).map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectExample(ex)}
                  className="text-[11px] px-2 py-1 rounded-lg bg-white dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-violet-950/30 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-violet-300 transition-colors"
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
