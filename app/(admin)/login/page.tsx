import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { QrCode, Shield } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
            <QrCode className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-zinc-900 dark:text-white">
            ReviewFlow
          </span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Agency Command Center
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to manage client businesses, QR codes & AI reviews
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 sm:px-10 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
          <Suspense fallback={<div className="h-48 flex items-center justify-center text-sm text-zinc-400">Loading sign in...</div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-tenant encrypted agency session</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

