import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center mx-auto mb-5">
          <FileQuestion className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Page Not Found</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 mb-8 leading-relaxed">
          The requested URL does not exist or the business review campaign is no longer active.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm transition-colors shadow-sm dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}

