import { Sparkles, Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FAF7F2] dark:bg-[#05060f] text-[#121E1B] dark:text-white">
      <div className="relative mb-4">
        <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 opacity-70 blur-[12px] animate-pulse" />
        <div className="relative w-14 h-14 rounded-2xl bg-[#121E1B] dark:bg-gradient-to-br dark:from-emerald-400 dark:via-teal-600 dark:to-emerald-800 p-[1px] shadow-lg flex items-center justify-center">
          <div className="w-full h-full rounded-[15px] bg-gradient-to-b from-white/30 to-transparent flex items-center justify-center border border-white/30 backdrop-blur-sm">
            <Sparkles size={26} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="currentColor" fillOpacity={0.3} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-[#485450] dark:text-slate-300">
        <Loader2 size={16} className="animate-spin text-[#121E1B] dark:text-emerald-400" />
        <span>Initializing promptHelper studio...</span>
      </div>
    </div>
  );
}
