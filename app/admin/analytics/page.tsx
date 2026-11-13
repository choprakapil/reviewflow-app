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
  Layers,
  ArrowRight,
  Sparkles,
  Smartphone
} from "lucide-react";
import Link from "next/link";
import { apiUrl } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
        const res = await fetch(apiUrl("/api/admin/businesses"));
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
            ? apiUrl("/api/admin/analytics/overview")
            : apiUrl(`/api/admin/analytics/overview?businessId=${selectedBusinessId}`);

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
    <div className="space-y-8">
      {/* Page Header with Business Filter Selector */}
      <PageHeader
        title="Reputation Telemetry & Conversion Analytics"
        description="Monitor in-store QR scans, review copy intent, and Google submission conversions per establishment."
        badge={<Badge variant="brand">Real-Time Telemetry</Badge>}
        actions={
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-subtle">
            <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              aria-label="Filter telemetry by establishment"
              className="text-xs font-semibold bg-transparent text-slate-800 focus:outline-none cursor-pointer pr-2"
            >
              <option value="all">All Establishments (Agency Portfolio)</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          <span className="text-sm font-medium">Aggregating telemetry records...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard
              label="Total QR Scans"
              value={data?.totalScans.toLocaleString() || "0"}
              subtext="All-time customer scans"
              icon={<QrCode className="w-5 h-5" />}
              iconBgClass="bg-indigo-50 text-indigo-600"
            />
            <KpiCard
              label="Suggestions Copied"
              value={data?.totalCopies.toLocaleString() || "0"}
              subtext="High-intent review drafts"
              icon={<MousePointerClick className="w-5 h-5" />}
              iconBgClass="bg-purple-50 text-purple-600"
            />
            <KpiCard
              label="Google Redirects"
              value={data?.totalRedirects.toLocaleString() || "0"}
              subtext="Review dialogs opened"
              icon={<ExternalLink className="w-5 h-5" />}
              iconBgClass="bg-emerald-50 text-emerald-600"
            />
            <KpiCard
              label="Conversion Rate"
              value={`${data?.conversionRate || "0.0"}%`}
              trend={{ value: "Target > 40%", isPositive: Number(data?.conversionRate || 0) >= 40 }}
              subtext="Scan to clipboard intent"
              icon={<TrendingUp className="w-5 h-5" />}
              iconBgClass="bg-amber-50 text-amber-600"
            />
          </div>

          {/* Consumer Conversion Funnel */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-5">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Consumer Conversion Funnel</span>
                </CardTitle>
                <CardDescription>
                  Drop-off tracking from in-store physical QR touchpoint to verified Google Review dialog
                </CardDescription>
              </div>
              {data?.business && (
                <Badge variant="brand" className="self-start sm:self-auto">
                  Filtering: {data.business.name}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Funnel Step 1 */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span className="font-medium text-slate-900">In-Store QR Code Scan</span>
                  </span>
                  <span className="font-mono text-slate-600">{data?.totalScans || 0} visits (100%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5">
                  <div className="bg-indigo-600 h-full rounded-full w-full transition-all duration-500" />
                </div>
              </div>

              {/* Funnel Step 2 */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span className="font-medium text-slate-900">AI Suggestion Copied to Clipboard</span>
                  </span>
                  <span className="font-mono text-slate-600">{data?.totalCopies || 0} copies ({data?.conversionRate || 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(2, Math.min(100, data?.conversionRate || 0))}%` }}
                  />
                </div>
              </div>

              {/* Funnel Step 3 */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span className="font-medium text-slate-900">Google Maps Review Dialog Transition</span>
                  </span>
                  <span className="font-mono text-slate-600">{data?.totalRedirects || 0} redirects ({data?.conversionRate || 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(2, Math.min(100, data?.conversionRate || 0))}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown Table (When "All Businesses" is selected) */}
          {selectedBusinessId === "all" && data?.businessesBreakdown && (
            <Card>
              <CardHeader className="border-b border-slate-100 pb-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Establishment Performance Breakdown</span>
                </CardTitle>
                <CardDescription>
                  Side-by-side comparison of review generation efficacy across managed client locations
                </CardDescription>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-5">Establishment</th>
                      <th className="py-3 px-5">Category</th>
                      <th className="py-3 px-5">In-Store Scans</th>
                      <th className="py-3 px-5">Drafts Copied</th>
                      <th className="py-3 px-5">Conversion Rate</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {data.businessesBreakdown.map((biz) => (
                      <tr key={biz.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-900">
                          {biz.name}
                        </td>
                        <td className="py-3.5 px-5 text-slate-500">
                          <Badge variant="neutral">{biz.category}</Badge>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-700">
                          {biz.totalScans}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-purple-700 font-semibold">
                          {biz.totalCopies}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {biz.conversionRate}%
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBusinessId(biz.id)}
                            className="text-indigo-600 hover:text-indigo-700 font-semibold"
                          >
                            <span>Inspect Funnel</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Live Recent Events Stream (When Specific Business is Selected) */}
          {selectedBusinessId !== "all" && data?.recentEvents && (
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-5">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>Recent Live In-Store Events</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time non-PII telemetry events for this establishment
                  </CardDescription>
                </div>
                <Badge variant="neutral">Last 15 records</Badge>
              </CardHeader>
              <CardContent className="pt-4">
                {data.recentEvents.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">
                    No scan or copy events recorded yet for this establishment.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.recentEvents.map((evt) => (
                      <div key={evt.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              evt.eventType === "COPY_AND_REDIRECT_CLICK"
                                ? "bg-purple-600"
                                : evt.eventType === "QR_SCAN"
                                ? "bg-indigo-600"
                                : "bg-emerald-600"
                            }`}
                          />
                          <span className="font-semibold text-slate-800">
                            {evt.eventType.replace(/_/g, " ")}
                          </span>
                          {(evt.browser || evt.os) && (
                            <span className="text-slate-400 text-[11px] hidden sm:inline">
                              • {evt.browser || "Unknown"} on {evt.os || "Device"}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 text-[11px] font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Compliance & Privacy Footer */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center gap-3 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong>Zero-PII Compliance Invariant:</strong> Client IP addresses are salted with a daily cryptographic secret and SHA-256 hashed. No patron tracking cookies, names, or persistent identities are stored.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
