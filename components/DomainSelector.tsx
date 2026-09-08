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
        <h2 className="text-lg font-bold text-[#121E1B] dark:text-white flex items-center gap-2 font-serif">
          <span className="w-6 h-6 rounded-lg bg-[#121E1B] dark:bg-violet-600 text-white flex items-center justify-center text-xs font-sans font-bold shadow-sm">
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
          return (
            <button
              key={domain.id}
              onClick={() => onSelect(domain)}
              className={`text-left p-2.5 rounded-xl border transition-all duration-200 group ${
                isSelected
                  ? "bg-[#F6F3EC] dark:bg-violet-950/40 border-[#121E1B] dark:border-violet-500 shadow-sm scale-[1.02]"
                  : "bg-white dark:bg-white/[0.02] border-[#E7E2D8] dark:border-white/5 hover:border-[#121E1B]/30 dark:hover:border-white/15 hover:scale-[1.01] shadow-[0_2px_8px_-2px_rgba(20,30,25,0.03)]"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                  isSelected
                    ? "bg-[#121E1B] text-white shadow-sm"
                    : "bg-[#F4EFE6] dark:bg-white/5 text-[#14201D] dark:text-slate-300 group-hover:bg-[#EAE4D8]"
                }`}
              >
                <IconRenderer name={domain.iconName} size={15} />
              </div>
              <div
                className={`text-xs font-bold truncate ${
                  isSelected
                    ? "text-[#121E1B] dark:text-violet-300"
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
            <div className="w-8 h-8 rounded-lg bg-[#121E1B] text-white flex items-center justify-center shadow-sm">
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
