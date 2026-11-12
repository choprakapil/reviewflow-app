import Link from "next/link";
import { QrCode, Sparkles, ShieldCheck, ArrowRight, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">
              ReviewFlow
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm"
            >
              <span>Agency Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Local Reputation Acceleration</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-3xl leading-[1.15]">
          Turn In-Store Foot Traffic into{" "}
          <span className="text-blue-600 dark:text-blue-500">5-Star Google Reviews</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Eliminate blank page hesitation. When patrons scan your dynamic QR code, our intelligent assistant suggests a tailored draft, copies it with one tap, and opens Google directly.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 mb-4">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
              Permanent Dynamic QRs
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Printed table tents and stickers never break. Update Google links or Place IDs anytime without re-printing collateral.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
              Frictionless 1-Tap Copy
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Patrons never type paragraphs on tiny mobile keyboards. Tailored drafts copy instantly to clipboard and launch Google Maps.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
              100% Policy Compliant
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Zero review gating, zero sentiment screening, zero fake bot reviews. Customers retain complete agency to edit and post.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ReviewFlow Engine. Engineered for digital marketing agencies.</p>
          <div className="flex items-center gap-1 text-zinc-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>High-conversion review architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

