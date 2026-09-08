"use client";

import { useEffect, useRef } from "react";
import { AIModel, Domain } from "@/types";
import { Loader2, CornerDownLeft, Eraser, Zap } from "lucide-react";
import StrategySelector from "@/components/StrategySelector";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  selectedAI: AIModel | null;
  selectedDomain: Domain | null;
  selectedStrategy: string;
  onSelectStrategy: (strategyId: string) => void;
}

export default function PromptInput({
  value,
  onChange,
  onGenerate,
  isLoading,
  selectedAI,
  selectedDomain,
  selectedStrategy,
  onSelectStrategy,
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Real-time token approximation (standard ~4 chars per token)
  const charCount = value.length;
  const estimatedTokens = Math.max(1, Math.ceil(charCount / 4));
  const maxChars = 2000;

  const canGenerate =
    value.trim().length >= 3 && selectedAI && selectedDomain && !isLoading;

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (canGenerate) {
          e.preventDefault();
          onGenerate();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canGenerate, onGenerate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#121E1B] dark:text-white flex items-center gap-2 font-serif">
            <span className="w-6 h-6 rounded-lg bg-[#121E1B] dark:bg-gradient-to-tr dark:from-emerald-600 dark:to-teal-500 text-white flex items-center justify-center text-xs font-sans font-bold shadow-sm">
              3
            </span>
            Your Request / Goal
          </h2>
          <p className="text-xs text-[#717E7A] dark:text-slate-400 mt-0.5">
            Type in rough, casual wording. We&apos;ll re-architect it into a clean, token-efficient prompt.
          </p>
        </div>

        {/* Clear Button */}
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex items-center gap-1 text-xs text-[#879692] hover:text-[#121E1B] dark:hover:text-slate-200 transition-colors"
          >
            <Eraser size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Textarea Container */}
      <div className="relative rounded-2xl border border-[#E7E2D8] dark:border-white/10 bg-white dark:bg-black/30 overflow-hidden focus-within:border-[#121E1B] dark:focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-[#121E1B]/5 dark:focus-within:ring-emerald-500/15 transition-all shadow-[0_2px_10px_-2px_rgba(20,30,25,0.03)]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
          placeholder={
            selectedAI
              ? `Describe what you want ${selectedAI.name} to do (e.g., "Build a full stack Next.js authentication flow with error boundaries and unit tests")...`
              : 'e.g., "Write a high-performance Python script to parse large JSON logs and export analytics to CSV"...'
          }
          rows={5}
          className="w-full bg-transparent text-[#121E1B] dark:text-slate-100 placeholder-[#98A6A2] p-4 text-sm leading-relaxed resize-none focus:outline-none"
        />

        {/* Bottom meta strip */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#FAF7F2] dark:bg-white/[0.02] border-t border-[#E7E2D8] dark:border-white/5 text-[11px] text-[#717E7A]">
          <div className="flex items-center gap-3">
            <span>
              {charCount}/{maxChars} chars
            </span>
            <span className="hidden sm:inline text-[#C4CFCB] dark:text-slate-600">
              •
            </span>
            <span className="hidden sm:inline flex items-center gap-1 font-mono text-[#44524E] dark:text-slate-300 font-medium">
              <Zap size={11} className="text-amber-500 dark:text-amber-400" /> ~{estimatedTokens} input tokens
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#879692]">
            <span className="hidden sm:inline">Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#EFECE4] dark:bg-white/10 font-mono text-[10px] text-[#121E1B] dark:text-slate-300 font-semibold">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#EFECE4] dark:bg-white/10 font-mono text-[10px] text-[#121E1B] dark:text-slate-300 font-semibold">
              Enter
            </kbd>
          </div>
        </div>
      </div>

      {/* Optimization Strategy */}
      <StrategySelector
        selectedId={selectedStrategy}
        onSelect={onSelectStrategy}
      />

      {/* Submit Button (Dark ink pill matching reference image) */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 ${
          canGenerate
            ? "bg-[#121E1B] hover:bg-[#1E332E] text-white shadow-lg shadow-black/10 dark:bg-gradient-to-r dark:from-emerald-600 dark:via-teal-600 dark:to-emerald-600 dark:hover:from-emerald-500 dark:hover:to-teal-500 dark:shadow-[0_0_25px_rgba(16,185,129,0.35)] ring-pulse cursor-pointer"
            : "bg-[#EFECE4] dark:bg-white/5 text-[#98A6A2] dark:text-slate-600 cursor-not-allowed border border-[#E7E2D8] dark:border-white/5"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin text-white" />
            <span>Architecting prompt with Gemini 3.7 Flash...</span>
          </>
        ) : (
          <>
            <Zap size={18} className="text-amber-400 dark:text-emerald-400" />
            <span>
              Generate Optimized Prompt
              {selectedAI ? ` for ${selectedAI.name}` : ""}
            </span>
            <CornerDownLeft size={14} className="opacity-70" />
          </>
        )}
      </button>
    </div>
  );
}
