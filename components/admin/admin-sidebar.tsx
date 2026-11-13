"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Building2, 
  QrCode, 
  BarChart3, 
  Settings, 
  LogOut, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn, apiUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Businesses", href: "/admin/businesses", icon: Building2 },
  { name: "QR Studio", href: "/admin/qr-studio", icon: QrCode },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  async function handleSignOut() {
    try {
      await signOut({ callbackUrl: apiUrl("/admin/login"), redirect: false });
    } catch (e) {
      console.warn("signOut error:", e);
    }
    // Hard clear session cookies across domains and paths
    document.cookie = "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "__Host-next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = apiUrl("/admin/login");
  }

  return (
    <aside
      className={cn(
        "w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-full",
        className
      )}
    >
      {/* Top Branding */}
      <div>
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <Link
            href="/admin/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <QrCode className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                ReviewFlow
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Agency Portal</span>
            </div>
          </Link>
          <Badge variant="default" size="sm" className="hidden sm:inline-flex">
            PRO
          </Badge>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              async function handleSignOut() {
    try {
      await signOut({ callbackUrl: apiUrl("/admin/login"), redirect: false });
    } catch (e) {
      console.warn("signOut error:", e);
    }
    // Hard clear session cookies across domains and paths
    document.cookie = "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "__Host-next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = apiUrl("/admin/login");
  }

  return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold shadow-subtle"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4.5 h-4.5 transition-colors",
                        isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-indigo-400 animate-in fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Area: AI Engine Badge & Account */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        {/* Zero-Cost AI Policy Chip */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Engine</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Free-Tier</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Gemini 3.5 & OpenRouter active.
          </p>
        </div>

        {/* User Account Info */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/60 shadow-subtle">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
              SA
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                Super Admin
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                admin@reviewflow.io
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

