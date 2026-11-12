"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  QrCode, 
  MousePointerClick, 
  ExternalLink, 
  TrendingUp, 
  ShieldCheck, 
  Loader2,
  Building2,
  Calendar,
  Laptop
} from "lucide-react";
import Link from "next/link";

interface BusinessBreakdownItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: string;
  totalScans: number;
  totalCopies: number;
  conversionRate: number;
}

interface AnalyticsData {
  totalBusinesses?: number;
  activeBusinesses?: number;
  totalScans: number;
  totalCopies: number;
  totalRedirects: number;
  conversionRate: number;
  businessesBreakdown?: BusinessBreakdownItem[];
  business?: {
    id: string;
    name: string;
    slug: string;
    category: string;
    status: string;
  };
  funnel?: Array<{ step: string; count: number; dropoff: string }>;
  recentEvents?: Array<{
    id: string;
    eventType: string;
    deviceType?: string | null;
    browser?: string | null;
    os?: string | null;
    createdAt: string;
  }>;
}

interface BusinessOption {
  id: string;
  name: string;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Load business list for filter dropdown
  useEffect(() => {
    async function loadBusinesses() {
      try {
        const res = await fetch("/api/admin/businesses");
        const json = await res.json();
        if (json.success) {
          setBusinesses(json.data);
        }
      } catch (err) {
        console.error("Failed to load business options:", err);
      }
    }
    loadBusinesses();
  }, []);

  // Load analytics (either portfolio or for selected business)
  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true);
      try {
        const url =
          selectedBusinessId === "all"
            ? "/api/admin/analytics/overview"
            : `/api/admin/analytics/overview?businessId=${selectedBusinessId}`;

        const res = await fetch(url);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load analytics telemetry:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, [selectedBusinessId]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Business Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Reputation Telemetry &amp; Conversion Analytics</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Track in-store QR scans, review copy intent, and Google submission conversions per establishment
          </p>
        </div>

        {/* Business Filter Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-2xl shadow-sm self-start sm:self-center">
          <Building2 className="w-4 h-4 text-blue-600 ml-2" />
          <select
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-transparent text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Establishments (Agency Portfolio)</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-zinc-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-sm">Calculating establishment telemetry...</span>
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
                <span className="text-xs text-zinc-400">All-time visits</span>
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
                <span className="text-xs text-zinc-400">High intent drafts</span>
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
                <span className="text-xs text-zinc-400">Review dialog opened</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Copy Conversion Rate
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-600">
                  {data?.conversionRate || "0.0"}%
                </span>
                <span className="text-xs text-emerald-600 font-medium flex items-center">
                  <TrendingUp className="w-3 h-3" />
                  <span>Target &gt;40%</span>
                </span>
              </div>
            </div>
          </div>

          {/* Funnel Dropoff Step Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center justify-between">
              <span>Consumer Conversion Funnel</span>
              {data?.business && (
                <span className="text-xs text-blue-600 font-medium">
                  Showing data for: {data.business.name}
                </span>
              )}
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>Step 1: In-Store QR Code Scan</span>
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
                    <span>Step 2: AI Suggestion Copied</span>
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
                    <span>Step 3: Google Maps Review Transition</span>
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
          </div>

          {/* Breakdown Table (When "All Businesses" is selected) */}
          {selectedBusinessId === "all" && data?.businessesBreakdown && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Establishment Performance Breakdown
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Business</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">In-Store Scans</th>
                      <th className="py-3 px-4">Drafts Copied</th>
                      <th className="py-3 px-4">Conversion Rate</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {data.businessesBreakdown.map((biz) => (
                      <tr key={biz.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">
                          {biz.name}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500">
                          {biz.category}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium">
                          {biz.totalScans}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-purple-600">
                          {biz.totalCopies}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                          {biz.conversionRate}%
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedBusinessId(biz.id)}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            View Funnel &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Live Recent Events Stream (When Specific Business is Selected) */}
          {selectedBusinessId !== "all" && data?.recentEvents && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                <span>Recent Live In-Store Events</span>
                <span className="text-xs font-normal text-zinc-400">Last 15 telemetry records</span>
              </h2>

              {data.recentEvents.length === 0 ? (
                <p className="text-xs text-zinc-400 py-6 text-center">
                  No scan or copy events recorded yet for this establishment.
                </p>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {data.recentEvents.map((evt) => (
                    <div key={evt.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            evt.eventType === "COPY_AND_REDIRECT_CLICK"
                              ? "bg-purple-600"
                              : evt.eventType === "QR_SCAN"
                              ? "bg-blue-600"
                              : "bg-emerald-600"
                          }`}
                        />
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {evt.eventType.replace(/_/g, " ")}
                        </span>
                        {(evt.browser || evt.os) && (
                          <span className="text-zinc-400 text-[11px] hidden sm:inline">
                            ({evt.browser || "Unknown"} on {evt.os || "Device"})
                          </span>
                        )}
                      </div>
                      <span className="text-zinc-400 text-[11px] font-mono">
                        {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex items-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Zero-PII Compliance: IP addresses are salted and SHA-256 hashed daily. No customer tracking cookies or identities are recorded.
            </span>
          </div>
        </div>
      )}
    </main>
  );
}
