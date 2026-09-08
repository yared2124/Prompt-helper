"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FAF7F2] dark:bg-[#05060f] text-[#121E1B] dark:text-white text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-500/10">
        <AlertTriangle size={28} />
      </div>
      <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2">
        Something went wrong
      </h1>
      <p className="text-xs sm:text-sm text-[#55635F] dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
        An unexpected error occurred in the prompt engine. Your saved library data in local storage is completely safe.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#121E1B] hover:bg-[#1E332E] dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold text-xs transition-all shadow-md"
        >
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-[#F2ECE1] border border-[#E7E2D8] dark:border-white/10 text-[#121E1B] dark:text-white font-semibold text-xs transition-all"
        >
          <Home size={14} />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
}
