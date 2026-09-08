"use client";

import { useState } from "react";
import { GenerateResponse, AIModel } from "@/types";
import {
  Copy,
  Check,
  BookmarkPlus,
  RefreshCw,
  ExternalLink,
  Download,
  FileText,
  Sliders,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

interface PromptOutputProps {
  result: GenerateResponse | null;
  selectedAI: AIModel | null;
  domainName: string;
  originalInput: string;
  onSave: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
  onShowToast: (message: string, type: "success" | "info") => void;
}

export default function PromptOutput({
  result,
  selectedAI,
  domainName,
  originalInput,
  onSave,
  onRegenerate,
  isLoading,
  onShowToast,
}: PromptOutputProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"prompt" | "compare" | "analysis">(
    "prompt"
  );

  if (!result && !isLoading) return null;

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.enhancedPrompt);
      setCopied(true);
      onShowToast("Prompt copied to clipboard! Ready to paste into AI.", "success");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      onShowToast("Failed to copy to clipboard", "info");
    }
  };

  const handleLaunchInAI = async () => {
    if (!result || !selectedAI) return;
    await navigator.clipboard.writeText(result.enhancedPrompt);
    onShowToast(`Copied! Opening ${selectedAI.name}...`, "success");
    window.open(selectedAI.webUrl, "_blank", "noopener,noreferrer");
  };

  const handleExportMarkdown = () => {
    if (!result || !selectedAI) return;
    const content = `# Prompt for ${selectedAI.name} (${selectedAI.provider})\n**Domain:** ${domainName}\n**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n## Optimized Prompt\n\n\`\`\`\n${result.enhancedPrompt}\n\`\`\`\n\n## Expert Tips\n${result.tips.map((t) => `- ${t}`).join("\n")}\n`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-${selectedAI.id}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast("Exported as Markdown file!", "success");
  };

  const handleExportJSON = () => {
    if (!result || !selectedAI) return;
    const data = {
      aiModel: selectedAI.name,
      provider: selectedAI.provider,
      domain: domainName,
      originalInput,
      optimizedPrompt: result.enhancedPrompt,
      tips: result.tips,
      tokensBefore: result.tokensBefore,
      tokensAfter: result.tokensAfter,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-${selectedAI.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast("Exported as JSON file!", "success");
  };

  const tokenDiff = result ? result.tokensAfter - result.tokensBefore : 0;
  const expansionPercent = result
    ? Math.round((result.tokensAfter / Math.max(result.tokensBefore, 1)) * 100)
    : 0;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header with Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            <Check size={14} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Optimized Prompt Architecture
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formatted specifically for {selectedAI?.name ?? "Target AI"} ({selectedAI?.provider})
            </p>
          </div>
        </div>

        {/* View Tabs */}
        {result && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
            <button
              onClick={() => setActiveTab("prompt")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "prompt"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Prompt
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "compare"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Side-by-Side Diff
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "analysis"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Analysis & Tips
            </button>
          </div>
        )}
      </div>

      {/* Token Economy Metrics Banner */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">
              Initial Input
            </span>
            <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
              ~{result.tokensBefore} tokens
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-violet-950/30 border border-indigo-200 dark:border-violet-500/30">
            <span className="text-[11px] text-indigo-600 dark:text-violet-400 uppercase font-semibold">
              Optimized Prompt
            </span>
            <div className="text-base font-bold font-mono text-indigo-700 dark:text-violet-300 mt-0.5">
              ~{result.tokensAfter} tokens
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
              Structural Gain
            </span>
            <div className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">
              +{expansionPercent}% clarity
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">
              Engine Grounding
            </span>
            <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
              <Sparkles size={13} className="text-amber-500" />
              <span>Zero Fluff</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 overflow-hidden shadow-md">
        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-violet-400">
              {selectedAI?.name} Prompt Block
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 font-mono text-slate-600 dark:text-slate-300">
              {domainName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Direct AI Launcher */}
            {selectedAI && (
              <button
                type="button"
                onClick={handleLaunchInAI}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-sm"
                title={`Copy and open directly in ${selectedAI.name}`}
              >
                <span>Open in {selectedAI.name}</span>
                <ExternalLink size={12} />
              </button>
            )}

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-semibold border transition-all ${
                copied
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              {copied ? (
                <>
                  <Check size={12} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Save to Library */}
            <button
              type="button"
              onClick={onSave}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-violet-400 border border-slate-200 dark:border-white/10 transition-colors"
              title="Save to Library"
            >
              <BookmarkPlus size={15} />
            </button>

            {/* Export Markdown */}
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-violet-400 border border-slate-200 dark:border-white/10 transition-colors"
              title="Export as Markdown (.md)"
            >
              <Download size={15} />
            </button>

            {/* Regenerate */}
            <button
              type="button"
              onClick={onRegenerate}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-violet-400 border border-slate-200 dark:border-white/10 transition-colors"
              title="Regenerate with alternative wording"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Tab 1: Optimized Prompt Display */}
        {activeTab === "prompt" && (
          <div className="p-5">
            {isLoading ? (
              <div className="space-y-3 py-4">
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-full animate-pulse" />
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-2/3 animate-pulse" />
              </div>
            ) : (
              <pre className="text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap select-all">
                {result?.enhancedPrompt}
              </pre>
            )}
          </div>
        )}

        {/* Tab 2: Side-by-Side Comparison */}
        {activeTab === "compare" && result && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-white/10 p-5 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Original Input
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {result.tokensBefore} tokens
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 leading-relaxed">
                {originalInput}
              </p>
            </div>

            <div className="space-y-2 md:pl-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} />
                  Engineered Structure
                </span>
                <span className="text-[11px] font-mono text-indigo-600 dark:text-violet-400 font-bold">
                  {result.tokensAfter} tokens
                </span>
              </div>
              <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 p-3 rounded-xl bg-indigo-50/40 dark:bg-violet-950/20 border border-indigo-200 dark:border-violet-500/20 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                {result.enhancedPrompt}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Analysis & Model Specific Tips */}
        {activeTab === "analysis" && result && (
          <div className="p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Prompt Engineering Techniques Applied
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Role Persona
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Establishes authority domain and calibrated vocabulary.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Constraint Fencing
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Strict boundary conditions to avoid hallucination & filler.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Targeted Output Schema
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Tailored specifically to how {selectedAI?.name} formats best.
                  </p>
                </div>
              </div>
            </div>

            {/* Model Tips */}
            {result.tips && result.tips.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-amber-500" />
                  <span>Tips for {selectedAI?.name} & {domainName}</span>
                </span>
                <ul className="space-y-1.5">
                  {result.tips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                    >
                      <span className="text-amber-500 font-bold shrink-0 mt-0.5">
                        •
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
