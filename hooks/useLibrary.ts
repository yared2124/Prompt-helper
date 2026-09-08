"use client";

import { useState, useEffect, useCallback } from "react";
import { GeneratedPrompt } from "@/types";

const STORAGE_KEY = "prompthelper_library";

export function useLibrary() {
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPrompts(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage whenever prompts change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  }, [prompts]);

  const savePrompt = useCallback((prompt: Omit<GeneratedPrompt, "id" | "savedAt">) => {
    const newPrompt: GeneratedPrompt = {
      ...prompt,
      id: `prompt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      savedAt: new Date().toISOString(),
    };
    setPrompts((prev) => [newPrompt, ...prev]);
    return newPrompt;
  }, []);

  const deletePrompt = useCallback((id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setPrompts([]);
  }, []);

  const importPrompts = useCallback((imported: GeneratedPrompt[]) => {
    setPrompts((prev) => [...imported, ...prev]);
  }, []);

  return { prompts, savePrompt, deletePrompt, clearAll, importPrompts };
}
