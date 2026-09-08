"use client";

import { useState, useMemo } from "react";
import { GeneratedPrompt } from "@/types";
import {
  BookmarkCheck,
  Trash2,
  Copy,
  X,
  Search,
  Download,
  Upload,
} from "lucide-react";

interface PromptLibraryProps {
  prompts: GeneratedPrompt[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onImport: (prompts: GeneratedPrompt[]) => void;
  onLoad: (prompt: GeneratedPrompt) => void;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type: "success" | "info") => void;
}

export default function PromptLibrary({
  prompts,
  onDelete,
  onClearAll,
  onImport,
  onLoad,
  isOpen,
  onClose,
  onShowToast,
}: PromptLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAI, setSelectedAI] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      const matchesSearch =
        p.originalInput.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.enhancedPrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.domain.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAI = selectedAI === "all" || p.aiModel === selectedAI;
      return matchesSearch && matchesAI;
    });
  }, [prompts, searchQuery, selectedAI]);

  const uniqueAIs = useMemo(() => {
    return Array.from(new Set(prompts.map((p) => p.aiModel)));
  }, [prompts]);

  const handleCopy = async (prompt: GeneratedPrompt) => {
    await navigator.clipboard.writeText(prompt.enhancedPrompt);
    setCopiedId(prompt.id);
    onShowToast("Prompt copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJSON = () => {
    if (prompts.length === 0) return;
    const blob = new Blob([JSON.stringify(prompts, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompthelper-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`Exported ${prompts.length} prompts to JSON!`, "success");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          onImport(data);
          onShowToast(`Imported ${data.length} prompts!`, "success");
        }
      } catch {
        onShowToast("Failed to parse JSON file", "info");
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative ml-auto h-full w-full max-w-lg bg-[#FAF7F2] dark:bg-[#090b17] border-l border-[#E7E2D8] dark:border-white/10 shadow-2xl flex flex-col z-10 animate-slide-left">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E7E2D8] dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkCheck size={20} className="text-[#121E1B] dark:text-violet-400" />
            <h3 className="font-bold text-base text-[#121E1B] dark:text-white font-serif">
              Prompt Library
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EFECE4] dark:bg-white/10 font-mono text-[#121E1B] dark:text-slate-300 font-semibold">
              {prompts.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {prompts.length > 0 && (
              <button
                onClick={handleExportJSON}
                className="p-1.5 rounded-lg text-[#717E7A] hover:text-[#121E1B] dark:hover:text-white transition-colors"
                title="Backup Library as JSON"
              >
                <Download size={16} />
              </button>
            )}

            <label
              className="p-1.5 rounded-lg text-[#717E7A] hover:text-[#121E1B] dark:hover:text-white transition-colors cursor-pointer"
              title="Import Library from JSON"
            >
              <Upload size={16} />
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJSON}
              />
            </label>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#717E7A] hover:text-[#121E1B] dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search & Filter Strip */}
        <div className="p-4 border-b border-[#E7E2D8] dark:border-white/10 space-y-2 bg-white/60 dark:bg-white/[0.02]">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#859490]"
            />
            <input
              type="text"
              placeholder="Search prompts or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-white/5 border border-[#E7E2D8] dark:border-white/10 text-[#121E1B] dark:text-slate-200 placeholder-[#98A6A2] focus:outline-none focus:border-[#121E1B]"
            />
          </div>

          {uniqueAIs.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[10px] text-[#717E7A] uppercase font-semibold">
                AI:
              </span>
              <button
                onClick={() => setSelectedAI("all")}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                  selectedAI === "all"
                    ? "bg-[#121E1B] text-white"
                    : "bg-[#EFECE4] dark:bg-white/10 text-[#485450] dark:text-slate-300"
                }`}
              >
                All
              </button>
              {uniqueAIs.map((ai) => (
                <button
                  key={ai}
                  onClick={() => setSelectedAI(ai)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${
                    selectedAI === ai
                      ? "bg-[#121E1B] text-white"
                      : "bg-[#EFECE4] dark:bg-white/10 text-[#485450] dark:text-slate-300"
                  }`}
                >
                  {ai}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List of Prompts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <BookmarkCheck size={40} className="text-[#A2B0AC] dark:text-slate-700 mb-3" />
              <p className="text-[#121E1B] dark:text-slate-400 font-semibold text-sm">
                {searchQuery ? "No matching prompts found" : "No saved prompts yet"}
              </p>
              <p className="text-[#717E7A] dark:text-slate-600 text-xs mt-1 max-w-xs">
                {searchQuery
                  ? "Try searching with different keywords"
                  : "Generate any prompt and click the bookmark button to save it locally in your browser."}
              </p>
            </div>
          ) : (
            filteredPrompts.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl border border-[#E7E2D8] dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-[#121E1B]/30 dark:hover:border-white/20 transition-all space-y-2.5 shadow-[0_2px_8px_-2px_rgba(20,30,25,0.03)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F4EFE6] dark:bg-violet-950/50 text-[#14201D] dark:text-violet-300">
                      {p.aiProvider}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E7E2D8] dark:bg-white/10 font-medium text-[#44524E] dark:text-slate-300">
                      {p.domain}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#879692]">
                    {new Date(p.savedAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-[#55635F] dark:text-slate-400 italic line-clamp-1">
                  &ldquo;{p.originalInput}&rdquo;
                </p>

                <p className="text-xs font-mono text-[#121E1B] dark:text-slate-200 line-clamp-3 leading-relaxed bg-[#FAF7F2] dark:bg-black/30 p-2.5 rounded-lg border border-[#E7E2D8] dark:border-white/5">
                  {p.enhancedPrompt}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(p)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                        copiedId === p.id
                          ? "bg-[#121E1B] text-white"
                          : "bg-[#F4EFE6] dark:bg-white/10 text-[#14201D] dark:text-slate-200 hover:bg-[#EAE4D8] dark:hover:bg-white/20"
                      }`}
                    >
                      <Copy size={12} />
                      <span>{copiedId === p.id ? "Copied!" : "Copy"}</span>
                    </button>
                    <button
                      onClick={() => onLoad(p)}
                      className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-[#121E1B] text-white hover:bg-[#1E332E] transition-colors"
                    >
                      Load into Editor
                    </button>
                  </div>

                  <button
                    onClick={() => onDelete(p.id)}
                    className="p-1.5 rounded-lg text-[#879692] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete prompt"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Clear All */}
        {prompts.length > 0 && (
          <div className="p-3 border-t border-[#E7E2D8] dark:border-white/10 flex items-center justify-between bg-white dark:bg-white/[0.02]">
            <span className="text-[11px] text-[#717E7A]">
              Stored locally in browser
            </span>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear your saved prompts?")) {
                  onClearAll();
                  onShowToast("Prompt library cleared", "info");
                }
              }}
              className="text-[11px] text-rose-600 hover:underline font-medium"
            >
              Clear all prompts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
