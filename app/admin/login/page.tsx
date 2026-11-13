import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { QrCode, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <QrCode className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            ReviewFlow
          </span>
        </Link>

        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Agency Command Center
        </h1>
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Manage client Google review links, dynamic QR campaigns, and FTC-compliant AI draft generation.
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-9 border border-slate-200 rounded-3xl shadow-card space-y-6">
          <Suspense fallback={<div className="h-44 flex items-center justify-center text-xs text-slate-400">Loading sign in...</div>}>
            <LoginForm />
          </Suspense>

          {/* Security & Multi-tenant Guarantee Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Multi-tenant Isolation</span>
            </div>
            <div className="flex items-center gap-1 text-indigo-600 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero-Cost AI Engine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
