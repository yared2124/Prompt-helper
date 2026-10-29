import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FAF7F2] dark:bg-[#05060f] text-[#121E1B] dark:text-white text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#121E1B] dark:bg-violet-600 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/10 dark:shadow-violet-500/30">
        <AlertCircle size={32} />
      </div>
      <h1 className="text-5xl sm:text-6xl font-serif font-bold mb-3 tracking-tight">
        404
      </h1>
      <h2 className="text-xl sm:text-2xl font-serif font-bold mb-3">
        Page Not Found
      </h2>
      <p className="text-sm text-[#55635F] dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        The prompt architecture or route you are looking for does not exist or has moved. Return to the prompt engineer studio.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#121E1B] hover:bg-[#1E332E] dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold text-sm transition-all shadow-md"
      >
        <ArrowLeft size={16} />
        <span>Return to promptHelper</span>
      </Link>
    </div>
  );
}
