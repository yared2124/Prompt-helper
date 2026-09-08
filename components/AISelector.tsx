"use client";

import { useState, useMemo } from "react";
import { AIModel } from "@/types";
import { Check, Search, Cpu } from "lucide-react";
import IconRenderer from "@/components/IconRenderer";

interface AISelectorProps {
  models: AIModel[];
  selected: AIModel | null;
  onSelect: (model: AIModel) => void;
  onSelectVariant?: (variant: string) => void;
  selectedVariant?: string;
}

export default function AISelector({
  models,
  selected,
  onSelect,
  onSelectVariant,
  selectedVariant,
}: AISelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesCategory =
        activeCategory === "all" || model.category === activeCategory;
      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.strengths.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [models, activeCategory, searchQuery]);

  const categories = [
    { id: "all", label: "All Models" },
    { id: "frontier", label: "Frontier (Claude / GPT / Gemini)" },
    { id: "reasoning", label: "Deep Reasoning" },
    { id: "opensource", label: "Open Weights" },
    { id: "specialized", label: "Specialized (Perplexity / Cohere)" },
  ];

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 dark:bg-violet-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              1
            </span>
            Target AI Model
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tailor structural tags, XML formats, and token density for your specific AI.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-56">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search model or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`text-xs px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {filteredModels.map((model) => {
          const isSelected = selected?.id === model.id;
          return (
            <button
              key={model.id}
              onClick={() => onSelect(model)}
              className={`relative group text-left p-3 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? `bg-indigo-50/80 dark:bg-violet-950/30 border-indigo-500 dark:border-violet-500 shadow-md ${model.bgGlow} scale-[1.02]`
                  : "bg-white/70 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:scale-[1.01]"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 dark:bg-violet-500 flex items-center justify-center shadow-sm">
                  <Check size={10} className="text-white" />
                </div>
              )}

              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-white/5 border border-indigo-200/50 dark:border-white/10 flex items-center justify-center text-indigo-600 dark:text-violet-400 shrink-0 group-hover:scale-105 transition-transform">
                  <IconRenderer name={model.iconName} size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {model.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {model.provider}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-tight min-h-[28px]">
                {model.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Model Focus & Variant Bar */}
      {selected && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-violet-950/60 border border-indigo-200 dark:border-violet-500/30 flex items-center justify-center text-indigo-600 dark:text-violet-400 shrink-0 shadow-sm">
              <IconRenderer name={selected.iconName} size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {selected.name}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-violet-500/20 text-indigo-700 dark:text-violet-300">
                  {selected.category}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {selected.strengths.map((str) => (
                  <span
                    key={str}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 flex items-center gap-1"
                  >
                    <Check size={10} className="text-indigo-600 dark:text-violet-400" />
                    <span>{str}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Model Variant Selector */}
          {selected.models.length > 1 && onSelectVariant && (
            <div className="flex items-center gap-2 shrink-0">
              <Cpu size={14} className="text-slate-400" />
              <select
                value={selectedVariant || selected.selectedModel}
                onChange={(e) => onSelectVariant(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                {selected.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
