"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  QrCode, 
  MousePointerClick, 
  ExternalLink, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Loader2
} from "lucide-react";

interface AnalyticsOverview {
  totalBusinesses: number;
  activeBusinesses: number;
  totalScans: number;
  totalCopies: number;
  totalRedirects: number;
  conversionRate: number;
}

interface BusinessItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  address?: string | null;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  _count?: {
    suggestions: number;
    analytics: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsRes, bizRes] = await Promise.all([
          fetch("/api/admin/analytics/overview"),
          fetch("/api/admin/businesses?status=ACTIVE"),
        ]);

        const statsJson = await statsRes.json();
        const bizJson = await bizRes.json();

        if (statsJson.success) {
          setStats(statsJson.data);
        }
        if (bizJson.success) {
          setBusinesses(bizJson.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard telemetry:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Agency Overview
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Real-time reputation performance, QR conversions and review generation metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/businesses"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Businesses</span>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-zinc-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-sm">Loading agency telemetry...</span>
        </div>
      ) : (
        <>
          {/* KPI 4-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Active Businesses
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  {stats?.activeBusinesses ?? businesses.length}
                </span>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>Live client profiles</span>
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Total In-Store Scans
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  {stats?.totalScans.toLocaleString() ?? "0"}
                </span>
                <span className="text-xs text-zinc-400">All time</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Suggestions Copied
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                  <MousePointerClick className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  {stats?.totalCopies.toLocaleString() ?? "0"}
                </span>
                <span className="text-xs text-purple-600 font-medium">
                  {stats?.conversionRate ?? 0}% conversion
                </span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Google Redirects
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  {stats?.totalRedirects.toLocaleString() ?? "0"}
                </span>
                <span className="text-xs text-amber-600 font-medium">Direct reviews posted</span>
              </div>
            </div>
          </div>

          {/* AI Health & Status Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-900/60 border border-blue-200/60 dark:border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Primary Engine: Google Gemini 2.0 Flash</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active & Healthy</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  OpenRouter free tier failover active • Tailored natural reviews enabled
                </p>
              </div>
            </div>

            <Link
              href="/admin/settings"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1 self-start sm:self-center"
            >
              <span>AI Settings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Access Client Grid */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base text-zinc-900 dark:text-white">
                Client Establishments
              </h2>
              <Link
                href="/admin/businesses"
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View All Businesses
              </Link>
            </div>

            {businesses.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-zinc-500 mb-3">No active client businesses found.</p>
                <Link
                  href="/admin/businesses"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Onboard Your First Client</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {businesses.slice(0, 5).map((biz) => (
                  <div key={biz.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-sm flex items-center justify-center">
                        {biz.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-zinc-900 dark:text-white">
                          {biz.name}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {biz.category} {biz.address && `• ${biz.address}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-zinc-500 hidden sm:inline">
                        {biz._count?.analytics ?? 0} Events
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                        Active
                      </span>
                      <Link
                        href={`/r/${biz.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Live QR</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
