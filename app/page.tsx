"use client";

import { useState } from "react";
import { AIModel, Domain, GeneratedPrompt } from "@/types";
import { AI_MODELS } from "@/data/aiModels";
import { DOMAINS } from "@/data/domains";
import { usePromptGenerator } from "@/hooks/usePromptGenerator";
import { useLibrary } from "@/hooks/useLibrary";

import Header from "@/components/Header";
import AISelector from "@/components/AISelector";
import DomainSelector from "@/components/DomainSelector";
import PromptInput from "@/components/PromptInput";
import PromptOutput from "@/components/PromptOutput";
import PromptLibrary from "@/components/PromptLibrary";
import ToastContainer, { ToastMessage } from "@/components/Toast";
import IconRenderer from "@/components/IconRenderer";
import {
  AlertCircle,
  Sparkles,
  Zap,
  ArrowDown,
  Terminal,
  Cpu,
  ShieldCheck,
  Flame,
} from "lucide-react";

export default function Home() {
  const [selectedAI, setSelectedAI] = useState<AIModel | null>(AI_MODELS[0]); // Default to Claude
  const [selectedVariant, setSelectedVariant] = useState<string>(
    AI_MODELS[0].selectedModel
  );
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(
    DOMAINS[0] // Default to Coding
  );
  const [selectedStrategy, setSelectedStrategy] = useState<string>("balanced");
  const [userInput, setUserInput] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const { result, isLoading, error, generate, reset } = usePromptGenerator();
  const { prompts, savePrompt, deletePrompt, clearAll, importPrompts } =
    useLibrary();

  const addToast = (message: string, type: "success" | "info" = "success") => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random()}`,
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectAI = (model: AIModel) => {
    setSelectedAI(model);
    setSelectedVariant(model.selectedModel);
  };

  const handleGenerate = async () => {
    if (!selectedAI || !selectedDomain || !userInput.trim()) return;
    await generate({
      userInput,
      aiModelId: selectedAI.id,
      domainId: selectedDomain.id,
      strategyId: selectedStrategy,
      targetModel: selectedVariant,
    });

    // Smooth scroll down to output
    setTimeout(() => {
      document.getElementById("prompt-output")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 250);
  };

  const handleSave = () => {
    if (!result || !selectedAI || !selectedDomain) return;
    savePrompt({
      originalInput: userInput,
      enhancedPrompt: result.enhancedPrompt,
      aiModel: selectedAI.id,
      aiProvider: selectedAI.name,
      domain: selectedDomain.name,
      strategy: selectedStrategy,
      tokensBefore: result.tokensBefore,
      tokensAfter: result.tokensAfter,
      tips: result.tips,
      metrics: result.metrics,
    });
    addToast("Saved to your local browser library!", "success");
  };

  const handleLoadPrompt = (prompt: GeneratedPrompt) => {
    const ai = AI_MODELS.find((m) => m.id === prompt.aiModel);
    const domain = DOMAINS.find((d) => d.name === prompt.domain);
    if (ai) {
      setSelectedAI(ai);
      setSelectedVariant(ai.selectedModel);
    }
    if (domain) setSelectedDomain(domain);
    if (prompt.strategy) setSelectedStrategy(prompt.strategy);
    setUserInput(prompt.originalInput);
    setLibraryOpen(false);
    reset();
    addToast("Loaded prompt into editor!", "info");
  };

  // 1-Click Interactive Demo Presets for LinkedIn Showcases
  const showcasePresets = [
    {
      label: "Python Binary Search Tree",
      aiId: "claude",
      domainId: "coding",
      strategyId: "production",
      text: "Implement a production-grade Binary Search Tree in Python 3.10 with full typing, delete/traversal operations, docstrings with Big-O complexity, and pytest tests.",
      badge: "Claude 3.7",
      iconName: "Code2",
    },
    {
      label: "Next.js 14 JWT Auth",
      aiId: "chatgpt",
      domainId: "coding",
      strategyId: "production",
      text: "Design a secure JWT authentication middleware in Next.js 14 App Router with HTTP-only refresh cookies, error boundaries, and rate limiting.",
      badge: "GPT-4o",
      iconName: "ShieldCheck",
    },
    {
      label: "Quantum Computing for 10yo",
      aiId: "gemini",
      domainId: "education",
      strategyId: "balanced",
      text: "Explain how quantum superposition and entanglement work using the coin-flip and magical dice analogies for a 10-year-old child.",
      badge: "Gemini 3.7",
      iconName: "Atom",
    },
    {
      label: "Fast DP LeetCode Hard",
      aiId: "deepseek",
      domainId: "coding",
      strategyId: "reasoning",
      text: "Solve the Traveling Salesperson Problem with bitmask dynamic programming in C++. Provide rigorous recurrence relation and space-optimized implementation.",
      badge: "DeepSeek R1",
      iconName: "Terminal",
    },
  ];

  const applyPreset = (preset: (typeof showcasePresets)[0]) => {
    const ai = AI_MODELS.find((m) => m.id === preset.aiId);
    const domain = DOMAINS.find((d) => d.id === preset.domainId);
    if (ai) {
      setSelectedAI(ai);
      setSelectedVariant(ai.selectedModel);
    }
    if (domain) setSelectedDomain(domain);
    setSelectedStrategy(preset.strategyId);
    setUserInput(preset.text);
    addToast(`Loaded "${preset.label}" preset!`, "info");
  };

  return (
    <div className="min-h-screen relative bg-warm-grid transition-colors duration-300 selection:bg-amber-500/20 dark:selection:bg-indigo-500/30">
      {/* Background Solar Orb in Light Mode / Nebulae in Dark Mode */}
      <div className="bg-orb w-[420px] h-[420px] bg-amber-300/60 dark:bg-violet-600 top-[-80px] left-[-80px]" />
      <div className="bg-orb w-80 h-80 bg-orange-200/50 dark:bg-indigo-600 top-[35%] right-[-80px]" />
      <div className="bg-orb w-72 h-72 bg-emerald-100/40 dark:bg-cyan-600 bottom-[10%] left-[15%]" />

      {/* Global Header */}
      <Header
        savedCount={prompts.length}
        onOpenLibrary={() => setLibraryOpen(true)}
      />

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Hero Section - Warm Editorial Design (Inspired by KeyCodes) */}
        <section className="text-center py-6 sm:py-10 space-y-5">
          {/* Eyebrow badge matching the image */}
          <div className="inline-flex items-center justify-center gap-2">
            <span className="w-5 h-[2px] bg-[#C2671A] dark:bg-violet-400" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#C2671A] dark:text-violet-400">
              AI Prompting
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-[#121E1B] dark:text-white leading-[1.12]">
            Architect prompts <br className="hidden sm:inline" />
            <span className="italic font-normal font-serif">under</span>{" "}
            <span className="text-[#1A5343] dark:gradient-text">real constraints.</span>
          </h1>

          <p className="text-[#4A5552] dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Stop wasting tokens with casual, ambiguous prompts. Tell promptHelper what you want in plain words — we transform it into an optimized, model-specific prompt tailored for Claude, ChatGPT, Gemini, and DeepSeek.
          </p>

          {/* Interactive 1-Click Demo Presets Bar */}
          <div className="pt-2 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#75827E] dark:text-slate-500 flex items-center justify-center gap-1.5">
              <Zap size={13} className="text-amber-500" />
              <span>Try 1-Click Interactive Showcase Presets:</span>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap max-w-2xl mx-auto">
              {showcasePresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-white/[0.03] border border-[#E6E1D7] dark:border-white/10 hover:border-[#121E1B]/40 dark:hover:border-white/20 text-xs font-semibold text-[#14201D] dark:text-slate-200 shadow-[0_2px_8px_-2px_rgba(20,30,25,0.04)] hover:shadow-md transition-all group"
                >
                  <IconRenderer
                    name={preset.iconName}
                    size={13}
                    className="text-[#1A5343] dark:text-violet-400 group-hover:scale-110 transition-transform"
                  />
                  <span>{preset.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F4EFE6] dark:bg-violet-950/60 text-[#14201D] dark:text-violet-300 font-mono font-semibold">
                    {preset.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-2xl mx-auto">
            {[
              { label: "AI Engines Supported", value: "10+ Models" },
              { label: "Domain Schemas", value: "12 Areas" },
              { label: "Token Efficiency", value: "Saves 30-50%" },
              { label: "Cloud Sync", value: "100% Private" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 rounded-xl bg-white/80 dark:bg-white/[0.02] border border-[#E7E2D8] dark:border-white/5 text-center shadow-[0_2px_10px_-2px_rgba(20,30,25,0.03)]"
              >
                <div className="text-sm sm:text-base font-bold text-[#121E1B] dark:text-white">
                  {stat.value}
                </div>
                <div className="text-[10px] text-[#717E7A] dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step 1: AI Model Selector */}
        <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
          <AISelector
            models={AI_MODELS}
            selected={selectedAI}
            onSelect={handleSelectAI}
            selectedVariant={selectedVariant}
            onSelectVariant={setSelectedVariant}
          />
        </section>

        {/* Step 2: Domain Context Selector */}
        <section className="glass-card rounded-2xl p-5 sm:p-6">
          <DomainSelector
            domains={DOMAINS}
            selected={selectedDomain}
            onSelect={setSelectedDomain}
            onSelectExample={(ex) => {
              setUserInput(ex);
              addToast("Example loaded into prompt goal!", "info");
            }}
          />
        </section>

        {/* Step 3: Prompt Goal Input & Strategy */}
        <section className="glass-card rounded-2xl p-5 sm:p-6">
          <PromptInput
            value={userInput}
            onChange={setUserInput}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            selectedAI={selectedAI}
            selectedDomain={selectedDomain}
            selectedStrategy={selectedStrategy}
            onSelectStrategy={setSelectedStrategy}
          />
        </section>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 animate-fade-in">
            <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-700 dark:text-rose-300">
              <span className="font-bold block mb-0.5">Generation Encountered an Issue:</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Step 4: Optimized Prompt Output */}
        {(result || isLoading) && (
          <section
            id="prompt-output"
            className="glass-card rounded-2xl p-5 sm:p-6"
          >
            <PromptOutput
              result={result}
              selectedAI={selectedAI}
              domainName={selectedDomain?.name ?? ""}
              originalInput={userInput}
              onSave={handleSave}
              onRegenerate={handleGenerate}
              isLoading={isLoading}
              onShowToast={addToast}
            />
          </section>
        )}

        {/* Value Proposition Grid (Why It Matters) */}
        {!result && !isLoading && (
          <section className="py-6 space-y-5">
            <h3 className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              The Architecture Behind Prompt Engineering
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  iconName: "Target",
                  title: "Model-Specific Idioms",
                  desc: "Claude responds with supreme precision to XML tags; ChatGPT excels with Markdown headers; DeepSeek thrives on Chain-of-Thought directives.",
                },
                {
                  iconName: "Zap",
                  title: "Token Compression",
                  desc: "Removes polite conversational filler, duplicate context, and ambiguity. Saves hundreds of tokens across multi-turn agent workflows.",
                },
                {
                  iconName: "ShieldCheck",
                  title: "Deterministic Schemas",
                  desc: "Enforces strict output formatting, typing, edge cases, and constraints to prevent hallucination in production environments.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-white/5 space-y-2.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-white/5 border border-indigo-200/50 dark:border-white/10 flex items-center justify-center text-indigo-600 dark:text-violet-400 shadow-sm">
                    <IconRenderer name={item.iconName} size={20} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t border-slate-200 dark:border-white/10">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            promptHelper · Production Portfolio Showcase · Built with{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Next.js 14, TypeScript & Tailwind CSS
            </span>
          </p>
        </footer>
      </main>

      {/* Slide-out Prompt Library */}
      <PromptLibrary
        prompts={prompts}
        onDelete={deletePrompt}
        onClearAll={clearAll}
        onImport={importPrompts}
        onLoad={handleLoadPrompt}
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onShowToast={addToast}
      />

      {/* Global Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
