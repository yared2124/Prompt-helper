import { Sparkles, Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FAF7F2] dark:bg-[#05060f] text-[#121E1B] dark:text-white">
      <div className="w-12 h-12 rounded-2xl bg-[#121E1B] dark:bg-gradient-to-tr dark:from-violet-600 dark:to-indigo-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-black/10 animate-pulse">
        <Sparkles size={24} className="text-amber-400" />
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-[#485450] dark:text-slate-300">
        <Loader2 size={16} className="animate-spin text-[#121E1B] dark:text-emerald-400" />
        <span>Initializing promptHelper studio...</span>
      </div>
    </div>
  );
}
