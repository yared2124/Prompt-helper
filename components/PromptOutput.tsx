"use client";

import { useState } from "react";
import { GenerateResponse, AIModel, TestPromptResponse } from "@/types";
import {
  Copy,
  Check,
  BookmarkPlus,
  RefreshCw,
  ExternalLink,
  Download,
  FileCode2,
  Zap,
  Lightbulb,
  Play,
  Terminal,
  Clock,
  Sparkles,
} from "lucide-react";

import { cleanPromptFormatting } from "@/lib/cleanPrompt";

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
  const [activeTab, setActiveTab] = useState<
    "prompt" | "compare" | "analysis" | "sandbox"
  >("prompt");
  const [isTesting, setIsTesting] = useState(false);
  const [sandboxResult, setSandboxResult] =
    useState<TestPromptResponse | null>(null);
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const displayPrompt = result?.enhancedPrompt
    ? cleanPromptFormatting(result.enhancedPrompt)
    : "";

  if (!result && !isLoading) return null;

  const handleCopy = async () => {
    if (!displayPrompt) return;
    try {
      await navigator.clipboard.writeText(displayPrompt);
      setCopied(true);
      onShowToast("Prompt copied to clipboard! Ready to paste into AI.", "success");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      onShowToast("Failed to copy to clipboard", "info");
    }
  };

  const handleLaunchInAI = async () => {
    if (!displayPrompt || !selectedAI) return;
    await navigator.clipboard.writeText(displayPrompt);
    onShowToast(`Copied! Opening ${selectedAI.name}...`, "success");
    window.open(selectedAI.webUrl, "_blank", "noopener,noreferrer");
  };

  const handleExportMarkdown = () => {
    if (!result || !selectedAI) return;
    const content = `PROMPT FOR ${selectedAI.name.toUpperCase()} (${selectedAI.provider.toUpperCase()})\nDomain: ${domainName}\nDate: ${new Date().toLocaleDateString()}\n\n---\n\nOPTIMIZED PROMPT:\n\n${displayPrompt}\n\nEXPERT TIPS:\n${result.tips.map((t) => `- ${cleanPromptFormatting(t)}`).join("\n")}\n`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-${selectedAI.id}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast("Exported as clean prompt file!", "success");
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

  const handleTestLive = async (compareWithOriginal = false) => {
    if (!displayPrompt) return;
    setActiveTab("sandbox");
    setIsTesting(true);
    setShowOriginalComparison(compareWithOriginal);
    try {
      const res = await fetch("/api/test-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: displayPrompt,
          originalInput,
          modelId: selectedAI?.id,
          compareOriginal: compareWithOriginal,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to execute prompt in sandbox");
      }
      const data: TestPromptResponse = await res.json();
      setSandboxResult(data);
      onShowToast("Prompt executed successfully in sandbox!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to test prompt";
      onShowToast(msg, "info");
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySandboxOutput = async () => {
    if (!sandboxResult?.response) return;
    try {
      await navigator.clipboard.writeText(sandboxResult.response);
      setCopiedOutput(true);
      onShowToast("AI response copied to clipboard!", "success");
      setTimeout(() => setCopiedOutput(false), 2000);
    } catch {
      onShowToast("Failed to copy output", "info");
    }
  };

  const expansionPercent = result
    ? Math.round((result.tokensAfter / Math.max(result.tokensBefore, 1)) * 100)
    : 0;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header with Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E2D8] dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-[#121E1B] dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            <Check size={14} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#121E1B] dark:text-white flex items-center gap-2 font-serif">
              Optimized Prompt Architecture
            </h2>
            <p className="text-xs text-[#717E7A] dark:text-slate-400">
              Formatted specifically for {selectedAI?.name ?? "Target AI"} ({selectedAI?.provider})
            </p>
          </div>
        </div>

        {/* View Tabs */}
        {result && (
          <div className="flex items-center gap-1 bg-[#F4EFE6] dark:bg-white/5 p-1 rounded-xl border border-[#E7E2D8] dark:border-white/10 text-xs">
            <button
              onClick={() => setActiveTab("prompt")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "prompt"
                  ? "bg-[#121E1B] text-white dark:bg-slate-800 dark:text-white shadow-sm font-semibold"
                  : "text-[#5A6965] dark:text-slate-400 hover:text-[#121E1B] dark:hover:text-white"
              }`}
            >
              Prompt
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "compare"
                  ? "bg-[#121E1B] text-white dark:bg-slate-800 dark:text-white shadow-sm font-semibold"
                  : "text-[#5A6965] dark:text-slate-400 hover:text-[#121E1B] dark:hover:text-white"
              }`}
            >
              Side-by-Side Diff
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "analysis"
                  ? "bg-[#121E1B] text-white dark:bg-slate-800 dark:text-white shadow-sm font-semibold"
                  : "text-[#5A6965] dark:text-slate-400 hover:text-[#121E1B] dark:hover:text-white"
              }`}
            >
              Analysis & Tips
            </button>
            <button
              onClick={() => {
                setActiveTab("sandbox");
                if (!sandboxResult && !isTesting) {
                  handleTestLive(false);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "sandbox"
                  ? "bg-[#121E1B] text-white dark:bg-emerald-600 dark:text-white shadow-sm font-semibold"
                  : "text-[#5A6965] dark:text-emerald-400 hover:text-[#121E1B] dark:hover:text-emerald-300"
              }`}
            >
              <Terminal size={13} />
              <span>Live Sandbox</span>
              {sandboxResult && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Token Economy Metrics Banner */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-[#E7E2D8] dark:border-white/10 shadow-[0_2px_8px_-2px_rgba(20,30,25,0.03)]">
            <span className="text-[11px] text-[#788884] dark:text-slate-400 uppercase font-semibold">
              Initial Input
            </span>
            <div className="text-base font-bold font-mono text-[#121E1B] dark:text-slate-200 mt-0.5">
              ~{result.tokensBefore} tokens
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-teal-950/30 border border-[#E7E2D8] dark:border-teal-500/30 shadow-[0_2px_8px_-2px_rgba(20,30,25,0.03)]">
            <span className="text-[11px] text-[#1A5343] dark:text-teal-400 uppercase font-semibold">
              Optimized Prompt
            </span>
            <div className="text-base font-bold font-mono text-[#1A5343] dark:text-teal-300 mt-0.5">
              ~{result.tokensAfter} tokens
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-emerald-950/30 border border-[#E7E2D8] dark:border-emerald-500/30 shadow-[0_2px_8px_-2px_rgba(20,30,25,0.03)]">
            <span className="text-[11px] text-[#C2671A] dark:text-emerald-400 uppercase font-semibold">
              Structural Gain
            </span>
            <div className="text-base font-bold font-mono text-[#C2671A] dark:text-emerald-300 mt-0.5">
              +{expansionPercent}% clarity
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-[#E7E2D8] dark:border-white/10 shadow-[0_2px_8px_-2px_rgba(20,30,25,0.03)]">
            <span className="text-[11px] text-[#788884] dark:text-slate-400 uppercase font-semibold">
              Engine Grounding
            </span>
            <div className="text-base font-bold text-[#121E1B] dark:text-slate-200 mt-0.5 flex items-center gap-1">
              <Zap size={13} className="text-amber-500" />
              <span>Zero Fluff</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="rounded-2xl border border-[#E7E2D8] dark:border-white/10 bg-white dark:bg-black/40 overflow-hidden shadow-[0_4px_24px_-4px_rgba(20,30,25,0.05)]">
        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#FAF7F2] dark:bg-white/[0.02] border-b border-[#E7E2D8] dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#121E1B] dark:text-emerald-400 font-mono">
              {selectedAI?.name} Prompt Block
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0EBE0] dark:bg-white/10 font-mono text-[#3E4D48] dark:text-slate-300 font-medium">
              {domainName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Live AI Sandbox Button */}
            <button
              type="button"
              onClick={() => handleTestLive(false)}
              disabled={isTesting}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold transition-all shadow-sm disabled:opacity-60 shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
              title="Execute prompt live in AI Sandbox"
              aria-label="Test prompt live in AI Sandbox"
            >
              {isTesting ? (
                <>
                  <RefreshCw size={12} className="animate-spin text-white" />
                  <span>Running Sandbox...</span>
                </>
              ) : (
                <>
                  <Play size={12} className="fill-white" />
                  <span>Test Live</span>
                </>
              )}
            </button>

            {/* Direct AI Launcher (sleek dark pill button) */}
            {selectedAI && (
              <button
                type="button"
                onClick={handleLaunchInAI}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#121E1B] hover:bg-[#1E332E] text-white font-semibold transition-all shadow-sm dark:bg-white/10 dark:hover:bg-white/15 dark:border dark:border-white/10"
                title={`Copy and open directly in ${selectedAI.name}`}
                aria-label={`Copy and open prompt in ${selectedAI.name}`}
              >
                <span>Open in {selectedAI.name}</span>
                <ExternalLink size={12} />
              </button>
            )}

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy optimized prompt"
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-semibold border transition-all ${
                copied
                  ? "bg-[#EBF5EE] text-[#1B4D3E] border-[#BFDEC7] dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40"
                  : "bg-white dark:bg-white/5 text-[#14201D] dark:text-slate-200 border-[#E7E2D8] dark:border-white/10 hover:bg-[#F5F2EA] dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 dark:hover:border-emerald-500/30"
              }`}
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} className="text-[#14201D] dark:text-emerald-400" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Save to Library */}
            <button
              type="button"
              onClick={onSave}
              className="p-1.5 rounded-lg bg-white dark:bg-white/5 text-[#485450] dark:text-amber-400 hover:text-[#121E1B] border border-[#E7E2D8] dark:border-white/10 hover:bg-[#F5F2EA] dark:hover:bg-amber-500/15 dark:hover:border-amber-500/30 transition-colors"
              title="Save to Library"
              aria-label="Save prompt to library"
            >
              <BookmarkPlus size={15} />
            </button>

            {/* Export Markdown */}
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="p-1.5 rounded-lg bg-white dark:bg-white/5 text-[#485450] dark:text-sky-400 hover:text-[#121E1B] border border-[#E7E2D8] dark:border-white/10 hover:bg-[#F5F2EA] dark:hover:bg-sky-500/15 dark:hover:border-sky-500/30 transition-colors"
              title="Export as Markdown (.md)"
              aria-label="Export prompt as Markdown file"
            >
              <Download size={15} />
            </button>

            {/* Regenerate */}
            <button
              type="button"
              onClick={onRegenerate}
              className="p-1.5 rounded-lg bg-white dark:bg-white/5 text-[#485450] dark:text-purple-400 hover:text-[#121E1B] border border-[#E7E2D8] dark:border-white/10 hover:bg-[#F5F2EA] dark:hover:bg-purple-500/15 dark:hover:border-purple-500/30 transition-colors"
              title="Regenerate with alternative wording"
              aria-label="Regenerate prompt"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Tab 1: Optimized Prompt Display */}
        {activeTab === "prompt" && (
          <div className="p-5 bg-white dark:bg-transparent">
            {isLoading ? (
              <div className="space-y-3 py-4">
                <div className="h-4 bg-[#F2EFE8] dark:bg-white/10 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-[#F2EFE8] dark:bg-white/10 rounded w-full animate-pulse" />
                <div className="h-4 bg-[#F2EFE8] dark:bg-white/10 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-[#F2EFE8] dark:bg-white/10 rounded w-2/3 animate-pulse" />
              </div>
            ) : (
              <pre className="text-xs sm:text-sm font-mono text-[#121E1B] dark:text-slate-100 leading-relaxed whitespace-pre-wrap select-all">
                {displayPrompt}
              </pre>
            )}
          </div>
        )}

        {/* Tab 2: Side-by-Side Comparison */}
        {activeTab === "compare" && result && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E7E2D8] dark:divide-white/10 p-5 gap-4 bg-white dark:bg-transparent">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#717E7A] uppercase tracking-wider">
                  Original Input
                </span>
                <span className="text-[11px] font-mono text-[#717E7A]">
                  {result.tokensBefore} tokens
                </span>
              </div>
              <p className="text-xs text-[#44524E] dark:text-slate-300 font-mono p-3 rounded-xl bg-[#FAF7F2] dark:bg-white/[0.02] border border-[#E7E2D8] dark:border-white/5 leading-relaxed">
                {originalInput}
              </p>
            </div>

            <div className="space-y-2 md:pl-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A5343] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <FileCode2 size={13} />
                  Engineered Structure
                </span>
                <span className="text-[11px] font-mono text-[#1A5343] dark:text-emerald-400 font-bold">
                  {result.tokensAfter} tokens
                </span>
              </div>
              <pre className="text-xs font-mono text-[#121E1B] dark:text-slate-200 p-3 rounded-xl bg-[#F6F3EC] dark:bg-emerald-950/20 border border-[#E7E2D8] dark:border-emerald-500/20 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                {displayPrompt}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Analysis & Model Specific Tips */}
        {activeTab === "analysis" && result && (
          <div className="p-5 space-y-4 bg-white dark:bg-transparent">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#717E7A] dark:text-slate-400 mb-2">
                Prompt Engineering Techniques Applied
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-white/[0.03] border border-[#E7E2D8] dark:border-white/10">
                  <div className="font-bold text-xs text-[#121E1B] dark:text-slate-200">
                    Role Persona
                  </div>
                  <p className="text-[11px] text-[#55635F] dark:text-slate-400 mt-0.5">
                    Establishes authority domain and calibrated vocabulary.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-white/[0.03] border border-[#E7E2D8] dark:border-white/10">
                  <div className="font-bold text-xs text-[#121E1B] dark:text-slate-200">
                    Constraint Fencing
                  </div>
                  <p className="text-[11px] text-[#55635F] dark:text-slate-400 mt-0.5">
                    Strict boundary conditions to avoid hallucination & filler.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-white/[0.03] border border-[#E7E2D8] dark:border-white/10">
                  <div className="font-bold text-xs text-[#121E1B] dark:text-slate-200">
                    Targeted Output Schema
                  </div>
                  <p className="text-[11px] text-[#55635F] dark:text-slate-400 mt-0.5">
                    Tailored specifically to how {selectedAI?.name} formats best.
                  </p>
                </div>
              </div>
            </div>

            {/* Model Tips */}
            {result.tips && result.tips.length > 0 && (
              <div className="p-4 rounded-xl bg-[#FFFBF0] dark:bg-amber-500/10 border border-[#F5E2B8] dark:border-amber-500/20 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A05C12] dark:text-amber-400 flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-[#A05C12] dark:text-amber-500" />
                  <span>Tips for {selectedAI?.name} & {domainName}</span>
                </span>
                <ul className="space-y-1.5">
                  {result.tips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-[#3D4744] dark:text-slate-300 flex items-start gap-2"
                    >
                      <span className="text-[#A05C12] dark:text-amber-500 font-bold shrink-0 mt-0.5">
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

        {/* Tab 4: Live AI Sandbox View */}
        {activeTab === "sandbox" && (
          <div className="p-5 bg-white dark:bg-transparent space-y-4">
            {isTesting ? (
              <div className="py-12 px-4 rounded-xl border border-dashed border-[#E7E2D8] dark:border-white/10 bg-[#FAF7F2] dark:bg-white/[0.02] flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin flex items-center justify-center" />
                  <Terminal size={16} className="absolute inset-0 m-auto text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#121E1B] dark:text-white">
                    Executing in AI Sandbox...
                  </p>
                  <p className="text-xs text-[#62736E] dark:text-slate-400 mt-0.5 font-mono">
                    Simulating live response for {selectedAI?.name || "AI"} with your engineered prompt
                  </p>
                </div>
              </div>
            ) : sandboxResult ? (
              <div className="space-y-4">
                {/* Sandbox Controls & Metrics */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#FAF7F2] dark:bg-white/[0.02] border border-[#E7E2D8] dark:border-white/10">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="flex items-center gap-1 text-[#1A5343] dark:text-emerald-400 font-semibold">
                      <Clock size={12} />
                      {(sandboxResult.executionTimeMs / 1000).toFixed(2)}s response
                    </span>
                    <span className="text-[#62736E] dark:text-slate-400">
                      ~{sandboxResult.tokensUsed} tokens
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {originalInput && (
                      <button
                        type="button"
                        onClick={() => handleTestLive(!showOriginalComparison)}
                        disabled={isTesting}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          showOriginalComparison
                            ? "bg-[#121E1B] text-white dark:bg-emerald-600/30 dark:border-emerald-500/40 dark:text-emerald-300"
                            : "bg-white dark:bg-white/5 text-[#3A4944] dark:text-slate-300 border-[#E7E2D8] dark:border-white/10 hover:bg-[#F2ECE1]"
                        }`}
                      >
                        {showOriginalComparison ? "Hide Raw Comparison" : "Compare Raw Input"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleCopySandboxOutput}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-white/5 border border-[#E7E2D8] dark:border-white/10 text-[#121E1B] dark:text-slate-200 hover:bg-[#F2ECE1] transition-all"
                    >
                      {copiedOutput ? (
                        <>
                          <Check size={12} className="text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Response Output: Single or Comparative */}
                {showOriginalComparison && sandboxResult.originalResponse ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E7E2D8] dark:divide-white/10 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#717E7A] uppercase tracking-wider">
                          Raw Input AI Response
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                          Generic / Vague
                        </span>
                      </div>
                      <div className="text-xs text-[#3E4D48] dark:text-slate-300 font-mono p-4 rounded-xl bg-[#FAF7F2] dark:bg-white/[0.02] border border-[#E7E2D8] dark:border-white/5 leading-relaxed whitespace-pre-wrap max-h-[480px] overflow-y-auto">
                        {sandboxResult.originalResponse}
                      </div>
                    </div>

                    <div className="space-y-2 md:pl-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1A5343] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles size={12} />
                          Engineered Prompt AI Response
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                          Production Grade
                        </span>
                      </div>
                      <div className="text-xs text-[#121E1B] dark:text-slate-100 font-mono p-4 rounded-xl bg-[#F6F3EC] dark:bg-emerald-950/20 border border-[#E7E2D8] dark:border-emerald-500/20 leading-relaxed whitespace-pre-wrap max-h-[480px] overflow-y-auto">
                        {sandboxResult.response}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#E7E2D8] dark:border-white/10 bg-[#FAF7F2] dark:bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#E7E2D8] dark:border-white/5">
                      <span className="text-xs font-bold text-[#1A5343] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Terminal size={13} />
                        Live AI Sandbox Response
                      </span>
                      <span className="text-[11px] font-mono text-[#6A7B76] dark:text-slate-400">
                        {selectedAI?.name} format
                      </span>
                    </div>
                    <pre className="text-xs sm:text-sm font-mono text-[#121E1B] dark:text-slate-100 leading-relaxed whitespace-pre-wrap select-all max-h-[500px] overflow-y-auto">
                      {sandboxResult.response}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 px-4 text-center rounded-xl border border-dashed border-[#E7E2D8] dark:border-white/10 bg-[#FAF7F2] dark:bg-white/[0.02] space-y-3">
                <Terminal size={28} className="mx-auto text-[#788884] dark:text-slate-400" />
                <div className="max-w-md mx-auto">
                  <p className="text-sm font-semibold text-[#121E1B] dark:text-white">
                    Test your prompt in real-time
                  </p>
                  <p className="text-xs text-[#62736E] dark:text-slate-400 mt-1">
                    Execute this engineered prompt against the AI engine to preview the exact output before pasting into your workflow.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestLive(false)}
                  className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-[#121E1B] hover:bg-[#1E332E] text-white font-semibold transition-all shadow-sm dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer"
                >
                  <Play size={12} className="fill-white" />
                  <span>Execute in Sandbox</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
