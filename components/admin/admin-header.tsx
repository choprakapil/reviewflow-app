"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";
import { apiUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();

  // If on login page, do not render header
  if (pathname === "/admin/login") return null;

  // Breadcrumb derivation
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((s) => s !== "admin");

  const currentTitle = segments.length > 0 
    ? segments[0].charAt(0).toUpperCase() + segments[0].slice(1).replace("-", " ")
    : "Dashboard";

  async function handleSignOut() {
    try {
      await signOut({ callbackUrl: apiUrl("/admin/login"), redirect: false });
    } catch (e) {
      console.warn("signOut error:", e);
    }
    document.cookie = "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "__Host-next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = apiUrl("/admin/login");
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open mobile navigation"
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
          <Link
            href="/admin/dashboard"
            className="text-slate-400 hover:text-slate-700 font-medium transition-colors"
          >
            Agency
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-slate-900">{currentTitle}</span>
        </nav>
      </div>

      {/* Right: Quick actions & Environment status */}
      <div className="flex items-center gap-3">
        {/* Zero-Cost Active Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero-Cost AI Active</span>
        </div>

        {/* View Live Test Portal shortcut */}
        <Link
          href="/r/apex-dental"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all shadow-subtle"
        >
          <span>Live Demo QR</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>

        {/* Quick Sign Out Action */}
        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl border border-slate-200 hover:border-rose-200 transition-all"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
