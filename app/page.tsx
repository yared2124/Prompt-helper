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
import { AlertCircle } from "lucide-react";

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

  const { result, isLoading, error, generate, reset, updateResult } =
    usePromptGenerator();
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

  // Example prompts for quick selection
  const showcasePresets = [
    {
      label: "Python Binary Search Tree",
      aiId: "claude",
      domainId: "coding",
      strategyId: "production",
      text: "Implement a production-grade Binary Search Tree in Python 3.10 with full typing, delete/traversal operations, docstrings with Big-O complexity, and pytest tests.",
    },
    {
      label: "Next.js 14 JWT Auth",
      aiId: "chatgpt",
      domainId: "coding",
      strategyId: "production",
      text: "Design a secure JWT authentication middleware in Next.js 14 App Router with HTTP-only refresh cookies, error boundaries, and rate limiting.",
    },
    {
      label: "Quantum Computing for 10yo",
      aiId: "gemini",
      domainId: "education",
      strategyId: "balanced",
      text: "Explain how quantum superposition and entanglement work using the coin-flip and magical dice analogies for a 10-year-old child.",
    },
    {
      label: "Fast DP LeetCode Hard",
      aiId: "deepseek",
      domainId: "coding",
      strategyId: "reasoning",
      text: "Solve the Traveling Salesperson Problem with bitmask dynamic programming in C++. Provide rigorous recurrence relation and space-optimized implementation.",
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
    <div className="min-h-screen relative">
      {/* Global Header */}
      <Header
        savedCount={prompts.length}
        onOpenLibrary={() => setLibraryOpen(true)}
      />

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-10">
        <section className="py-10 space-y-4 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Write better prompts, faster.
          </h1>
          <p className="text-[var(--text-muted)] leading-relaxed">
            Describe what you want in plain words. promptHelper rewrites it into a
            structured prompt for the model you pick.
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            <span className="basis-full text-sm text-[var(--text-muted)]">Examples</span>
            {showcasePresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 rounded-md border border-[var(--border)] text-sm hover:border-[var(--text-muted)]"
              >
                {preset.label}
              </button>
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
              onUpdateResult={updateResult}
              isLoading={isLoading}
              onShowToast={addToast}
            />
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t border-slate-200 dark:border-white/10">
          <p className="text-xs text-[#121E1B] dark:text-slate-400">
            promptHelper · Built with{" "}
            <span className="font-semibold text-black dark:text-slate-200">
              Next.js, TypeScript & Tailwind CSS
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
