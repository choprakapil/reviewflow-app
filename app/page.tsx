import Link from "next/link";
import { QrCode, Sparkles, ShieldCheck, ArrowRight, Star, CheckCircle2, Zap, BarChart3, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                ReviewFlow
              </span>
              <Badge variant="brand" className="hidden sm:inline-flex text-[10px]">v1.2 SaaS</Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm active:scale-98"
            >
              <span>Agency Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-16 sm:py-24 flex flex-col items-center text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-6 shadow-subtle">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Next-Gen In-Store Reputation Automation</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 max-w-3xl leading-[1.12]">
          Turn In-Store Foot Traffic into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-700">
            5-Star Google Reviews
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
          Eliminate blank page hesitation. When patrons scan your dynamic QR code, our intelligent assistant suggests a personalized draft, copies it in one tap, and opens Google directly.
        </p>

        {/* Hero Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/admin/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md active:scale-98"
          >
            <span>Launch Agency Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/admin/qr-studio"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 transition-all shadow-subtle"
          >
            <QrCode className="w-4 h-4 text-indigo-600" />
            <span>Generate Dynamic QR</span>
          </Link>
        </div>

        {/* Trust & Compliance Indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Google Policy Compliant</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero Review Gating</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero-Cost AI Architecture</span>
          </span>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-card hover:border-slate-300 transition-all">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-subtle">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Permanent Dynamic QRs
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Physical table tents and stickers never break. Update Google review URLs or Place IDs anytime in the cloud without re-printing collateral.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-card hover:border-slate-300 transition-all">
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4 shadow-subtle">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Frictionless 1-Tap Copy
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Patrons never type lengthy paragraphs on cramped mobile keyboards. Tailored drafts copy instantly to clipboard and open Google Maps.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-card hover:border-slate-300 transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-subtle">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              100% Policy Compliant
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Zero review gating, zero sentiment screening, and zero fake bot reviews. Customers retain complete agency to edit and post genuine feedback.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ReviewFlow Engine. Engineered for digital marketing agencies.</p>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-700">Light-First Enterprise SaaS Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
