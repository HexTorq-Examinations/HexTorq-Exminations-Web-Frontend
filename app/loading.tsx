import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm dark:bg-slate-900/50">
      <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading...</p>
      </div>
    </div>
  );
}
