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

const MODEL_THEMES: Record<
  string,
  {
    darkText: string;
    darkBg: string;
    darkBorder: string;
    glow: string;
  }
> = {
  claude: {
    darkText: "dark:text-amber-400",
    darkBg: "dark:bg-amber-500/15",
    darkBorder: "dark:border-amber-500/30",
    glow: "dark:shadow-[0_0_16px_rgba(245,158,11,0.2)] dark:border-amber-500/50",
  },
  chatgpt: {
    darkText: "dark:text-emerald-400",
    darkBg: "dark:bg-emerald-500/15",
    darkBorder: "dark:border-emerald-500/30",
    glow: "dark:shadow-[0_0_16px_rgba(16,185,129,0.2)] dark:border-emerald-500/50",
  },
  gemini: {
    darkText: "dark:text-blue-400",
    darkBg: "dark:bg-blue-500/15",
    darkBorder: "dark:border-blue-500/30",
    glow: "dark:shadow-[0_0_16px_rgba(59,130,246,0.2)] dark:border-blue-500/50",
  },
  deepseek: {
    darkText: "dark:text-cyan-400",
    darkBg: "dark:bg-cyan-500/15",
    darkBorder: "dark:border-cyan-500/30",
    glow: "dark:shadow-[0_0_16px_rgba(6,182,212,0.2)] dark:border-cyan-500/50",
  },
  grok: {
    darkText: "dark:text-yellow-400",
    darkBg: "dark:bg-yellow-500/15",
    darkBorder: "dark:border-yellow-500/30",
    glow: "dark:shadow-[0_0_16px_rgba(234,179,8,0.2)] dark:border-yellow-500/50",
  },
  mistral: {
    darkText: "dark:text-orange-400",
    darkBg: "dark:bg-orange-500/15",
    darkBorder: "dark:border-orange-500/30",
    glow: "dark:shadow-[0_0_16px_rgba(249,115,22,0.2)] dark:border-orange-500/50",
  },
  llama: {
    darkText: "dark:text-indigo-400",
    darkBg: "dark:bg-indigo-500/15",
    darkBorder: "dark:border-indigo-500/30",
    glow: "dark:shadow-[0_0_16px_rgba(99,102,241,0.2)] dark:border-indigo-500/50",
  },
  perplexity: {
    darkText: "dark:text-teal-400",
    darkBg: "dark:bg-teal-500/15",
    darkBorder: "dark:border-teal-500/30",
    glow: "dark:shadow-[0_0_16px_rgba(20,184,166,0.2)] dark:border-teal-500/50",
  },
  cohere: {
    darkText: "dark:text-rose-400",
    darkBg: "dark:bg-rose-500/15",
    darkBorder: "dark:border-rose-500/30",
    glow: "dark:shadow-[0_0_16px_rgba(244,63,94,0.2)] dark:border-rose-500/50",
  },
  qwen: {
    darkText: "dark:text-purple-400",
    darkBg: "dark:bg-purple-500/15",
    darkBorder: "dark:border-purple-500/30",
    glow: "dark:shadow-[0_0_16px_rgba(168,85,247,0.2)] dark:border-purple-500/50",
  },
};

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

  const activeTheme = selected ? MODEL_THEMES[selected.id] : null;

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#121E1B] dark:text-white flex items-center gap-2 font-serif">
            <span className="w-6 h-6 rounded-lg bg-[#121E1B] dark:bg-gradient-to-tr dark:from-violet-600 dark:to-indigo-500 text-white flex items-center justify-center text-xs font-sans font-bold shadow-sm">
              1
            </span>
            Target AI Model
          </h2>
          <p className="text-xs text-[#717E7A] dark:text-slate-400 mt-0.5">
            Tailor structural tags, XML formats, and token density for your specific AI.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-56">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#859490] dark:text-slate-400"
          />
          <input
            type="text"
            placeholder="Search model or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-white/5 border border-[#E7E2D8] dark:border-white/10 text-[#121E1B] dark:text-slate-200 placeholder-[#98A6A2] focus:outline-none focus:border-[#121E1B] dark:focus:border-violet-500 transition-colors shadow-[0_1px_4px_rgba(20,30,25,0.02)]"
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
                ? "bg-[#121E1B] text-white dark:bg-white dark:text-slate-900 shadow-sm font-semibold"
                : "bg-white dark:bg-white/5 border border-[#E7E2D8] dark:border-white/5 text-[#4E5B57] dark:text-slate-400 hover:bg-[#F5F2EA] dark:hover:bg-white/10"
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
          const theme = MODEL_THEMES[model.id] || {
            darkText: "dark:text-violet-400",
            darkBg: "dark:bg-violet-500/15",
            darkBorder: "dark:border-violet-500/30",
            glow: "dark:shadow-[0_0_16px_rgba(139,92,246,0.2)] dark:border-violet-500/50",
          };

          return (
            <button
              key={model.id}
              onClick={() => onSelect(model)}
              className={`relative group text-left p-3 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? `bg-[#F6F3EC] dark:bg-white/[0.04] border-[#121E1B] shadow-md scale-[1.02] ${theme.glow}`
                  : "bg-white dark:bg-white/[0.02] border-[#E7E2D8] dark:border-white/5 hover:border-[#121E1B]/40 dark:hover:border-white/20 hover:scale-[1.01] shadow-[0_2px_8px_-2px_rgba(20,30,25,0.03)]"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#121E1B] dark:bg-emerald-500 flex items-center justify-center shadow-sm">
                  <Check size={10} className="text-white" />
                </div>
              )}

              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? `bg-[#121E1B] text-white shadow-sm dark:shadow-[0_0_10px_rgba(255,255,255,0.15)] ${theme.darkBg} ${theme.darkText} dark:border ${theme.darkBorder}`
                      : `bg-[#F4EFE6] border border-[#E5DFD4] text-[#14201D] group-hover:bg-[#ECE5D8] ${theme.darkBg} ${theme.darkText} dark:border ${theme.darkBorder}`
                  }`}
                >
                  <IconRenderer name={model.iconName} size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-[#121E1B] dark:text-white truncate">
                    {model.name}
                  </div>
                  <div className="text-[11px] text-[#717E7A] dark:text-slate-400 truncate">
                    {model.provider}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#55635F] dark:text-slate-400 line-clamp-2 leading-tight min-h-[28px]">
                {model.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Model Focus & Variant Bar */}
      {selected && (
        <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-[#E7E2D8] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-[0_2px_10px_-2px_rgba(20,30,25,0.03)]">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-[#121E1B] border border-[#121E1B] flex items-center justify-center text-white shrink-0 shadow-sm ${
                activeTheme
                  ? `${activeTheme.darkBg} ${activeTheme.darkText} dark:border ${activeTheme.darkBorder} dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]`
                  : "dark:bg-violet-950/60 dark:border-violet-500/30 dark:text-violet-400"
              }`}
            >
              <IconRenderer name={selected.iconName} size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-[#121E1B] dark:text-white">
                  {selected.name}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EFECE4] dark:bg-white/10 text-[#1A4B3C] dark:text-slate-200">
                  {selected.category}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {selected.strengths.map((str) => (
                  <span
                    key={str}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F2] dark:bg-white/5 border border-[#E7E2D8] dark:border-white/10 text-[#44524E] dark:text-slate-300 flex items-center gap-1 font-medium"
                  >
                    <Check
                      size={10}
                      className={activeTheme?.darkText || "text-[#1A5343] dark:text-violet-400"}
                    />
                    <span>{str}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Model Variant Selector */}
          {selected.models.length > 1 && onSelectVariant && (
            <div className="flex items-center gap-2 shrink-0">
              <Cpu size={14} className="text-[#758480]" />
              <select
                value={selectedVariant || selected.selectedModel}
                onChange={(e) => onSelectVariant(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] dark:bg-slate-900 border border-[#E7E2D8] dark:border-white/15 text-[#121E1B] dark:text-slate-200 focus:outline-none focus:border-[#121E1B] dark:focus:border-indigo-500 font-mono"
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
