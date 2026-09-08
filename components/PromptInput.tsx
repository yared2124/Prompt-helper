"use client";

import { useEffect, useRef } from "react";
import { AIModel, Domain } from "@/types";
import { Sparkles, Loader2, CornerDownLeft, Eraser, Zap } from "lucide-react";
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
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 dark:bg-violet-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              3
            </span>
            Your Request / Goal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Type in rough, casual wording. We&apos;ll re-architect it into a clean, token-efficient prompt.
          </p>
        </div>

        {/* Clear Button */}
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Eraser size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Textarea Container */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 overflow-hidden focus-within:border-indigo-500 dark:focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all shadow-sm">
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
          className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 p-4 text-sm leading-relaxed resize-none focus:outline-none"
        />

        {/* Bottom meta strip */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              {charCount}/{maxChars} chars
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">
              •
            </span>
            <span className="hidden sm:inline flex items-center gap-1 font-mono text-slate-500 dark:text-slate-400">
              <Zap size={11} className="text-amber-500" /> ~{estimatedTokens} input tokens
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span className="hidden sm:inline">Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-[10px] text-slate-600 dark:text-slate-300">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-[10px] text-slate-600 dark:text-slate-300">
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

      {/* Submit Button */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md ${
          canGenerate
            ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25 ring-pulse cursor-pointer"
            : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-white/5"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin text-white" />
            <span>Architecting prompt with Gemini 3.7 Flash...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} />
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
