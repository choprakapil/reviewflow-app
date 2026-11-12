"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  QrCode, 
  MousePointerClick, 
  ExternalLink, 
  TrendingUp, 
  ShieldCheck, 
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

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics/overview");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load analytics overview:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <span>Reputation Telemetry & Conversion Funnels</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Privacy-friendly scan heatmaps, copy intent conversions, and client ROI metrics
        </p>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-zinc-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-sm">Calculating portfolio metrics...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Total QR Scans
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                  {data?.totalScans.toLocaleString() || "0"}
                </span>
                <span className="text-xs text-zinc-400">All-time</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Suggestions Copied
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-purple-600">
                  {data?.totalCopies.toLocaleString() || "0"}
                </span>
                <span className="text-xs text-zinc-400">High intent</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Google Redirects
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600">
                  {data?.totalRedirects.toLocaleString() || "0"}
                </span>
                <span className="text-xs text-zinc-400">Direct modal opens</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Conversion Rate
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-600">
                  {data?.conversionRate || "0.0"}%
                </span>
                <span className="text-xs text-emerald-600 font-medium flex items-center">
                  <TrendingUp className="w-3 h-3" />
                  <span>Benchmark &gt;45%</span>
                </span>
              </div>
            </div>
          </div>

          {/* Funnel Dropoff Step Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              End-to-End Consumer Conversion Funnel
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>Step 1: In-Store QR Scan</span>
                  </span>
                  <span>{data?.totalScans || 0} visits (100%)</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <MousePointerClick className="w-4 h-4 text-purple-600" />
                    <span>Step 2: Suggestion Copied</span>
                  </span>
                  <span>{data?.totalCopies || 0} copies ({data?.conversionRate || 0}%)</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, data?.conversionRate || 0)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                    <span>Step 3: Google Maps Review Dialog Transition</span>
                  </span>
                  <span>{data?.totalRedirects || 0} redirects ({data?.conversionRate || 0}%)</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, data?.conversionRate || 0)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Privacy Notice: IP addresses are salted and hashed (SHA-256). Zero customer PII or tracking cookies are recorded.
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

