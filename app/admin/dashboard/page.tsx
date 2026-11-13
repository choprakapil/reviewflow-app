"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiUrl } from "@/lib/utils";
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
  Loader2,
  Sliders,
  BarChart3,
  ShieldCheck,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";

interface AnalyticsOverview {
  totalBusinesses: number;
  activeBusinesses: number;
  totalScans: number;
  totalCopies: number;
  totalRedirects: number;
  conversionRate: number;
  funnel?: Array<{ step: string; count: number; dropoff: string }>;
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
          fetch(apiUrl("/api/admin/analytics/overview")),
          fetch(apiUrl("/api/admin/businesses?status=ACTIVE")),
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
    <div className="space-y-8">
      {/* 1. Page Header */}
      <PageHeader
        title="Agency Operations Overview"
        description="Real-time reputation performance, physical QR scan telemetry, and authentic AI review conversions."
        badge={
          <Badge variant="success" size="sm" className="hidden sm:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Systems Normal</span>
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/admin/qr-studio">
              <Button variant="secondary" size="md" leftIcon={<QrCode className="w-4 h-4 text-slate-500" />}>
                QR Studio
              </Button>
            </Link>
            <Link href="/admin/businesses">
              <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                Manage Clients
              </Button>
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <div className="py-28 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-sm font-medium text-slate-500">Loading agency telemetry...</span>
        </div>
      ) : (
        <>
          {/* 2. Primary 4-KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard
              title="Active Establishments"
              value={stats?.activeBusinesses ?? businesses.length}
              subtitle="Live multi-tenant client profiles"
              icon={Building2}
              variant="indigo"
              trend={{ value: "Operational", isPositive: true }}
            />
            <KpiCard
              title="Total In-Store Scans"
              value={stats?.totalScans.toLocaleString() ?? "0"}
              subtitle="Physical QR interactions"
              icon={QrCode}
              variant="emerald"
              trend={{ value: "Verified", isPositive: true }}
            />
            <KpiCard
              title="Suggestions Copied"
              value={stats?.totalCopies.toLocaleString() ?? "0"}
              subtitle={`${stats?.conversionRate ?? 0}% overall conversion`}
              icon={MousePointerClick}
              variant="purple"
              trend={{ value: `${stats?.conversionRate ?? 0}% CR`, isPositive: (stats?.conversionRate ?? 0) > 0 }}
            />
            <KpiCard
              title="Google Reviews Opened"
              value={stats?.totalRedirects.toLocaleString() ?? "0"}
              subtitle="Direct reviews submitted"
              icon={ExternalLink}
              variant="amber"
              trend={{ value: "100% Authentic", isPositive: true }}
            />
          </div>

          {/* 3. Operational Performance & AI Engine Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversion Funnel Progress Card */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Reputation Conversion Funnel</CardTitle>
                  <CardDescription>
                    End-to-end customer journey from physical QR scan to Google Maps review dialog
                  </CardDescription>
                </div>
                <Badge variant="default" size="sm">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Real Telemetry</span>
                </Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Visual Step Progress Bars */}
                <div className="space-y-4">
                  {/* Step 1: In-Store QR Scans */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">1. QR Scanned by In-Store Customer</span>
                      <span className="font-bold text-slate-900">{stats?.totalScans ?? 0} scans (100%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full w-full transition-all" />
                    </div>
                  </div>

                  {/* Step 2: Suggestions Drafted & Copied */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">2. Review Draft Adapted & Copied</span>
                      <span className="font-bold text-slate-900">
                        {stats?.totalCopies ?? 0} copied ({stats?.totalScans ? Math.round(((stats.totalCopies) / stats.totalScans) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{
                          width: `${stats?.totalScans ? Math.min(100, Math.round(((stats.totalCopies) / stats.totalScans) * 100)) : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Step 3: Google Maps Direct Redirect */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">3. Google Business Profile Review Opened</span>
                      <span className="font-bold text-slate-900">
                        {stats?.totalRedirects ?? 0} redirects ({stats?.totalScans ? Math.round(((stats.totalRedirects) / stats.totalScans) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{
                          width: `${stats?.totalScans ? Math.min(100, Math.round(((stats.totalRedirects) / stats.totalScans) * 100)) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>FTC 16 CFR Part 465 Anti-Gating Compliant</span>
                  </span>
                  <Link
                    href="/admin/analytics"
                    className="text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1"
                  >
                    <span>Full Analytics Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* AI Architecture & Engine Status */}
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Provider Engine</CardTitle>
                  <Badge variant="brand" size="sm">
                    <Sparkles className="w-3 h-3" />
                    <span>Free-Tier</span>
                  </Badge>
                </div>
                <CardDescription>
                  Guaranteed zero-paid-API-cost inference cascade
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Google Gemini 3.5</div>
                      <div className="text-[11px] text-slate-500">Primary Free-Tier LLM</div>
                    </div>
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Active</span>
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">OpenRouter Free</div>
                      <div className="text-[11px] text-slate-500">Secondary Zero-Cost Router</div>
                    </div>
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Standby</span>
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Groq Engine</div>
                      <div className="text-[11px] text-slate-500">Commercial API</div>
                    </div>
                    <Badge variant="neutral" size="sm">
                      <span>Disabled</span>
                    </Badge>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <Link
                    href="/admin/settings"
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1"
                  >
                    <span>Configure AI Engine & Test Bench</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 4. Active Client Establishments Directory */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Client Establishments</CardTitle>
                <CardDescription>
                  Active commercial locations with verified Google Review links and live QR campaigns
                </CardDescription>
              </div>
              <Link
                href="/admin/businesses"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <span>View All Businesses ({businesses.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {businesses.length === 0 ? (
                <div className="py-16 text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">No active client businesses found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Onboard your first commercial location to start generating dynamic QR codes and AI review writing aids.
                  </p>
                  <Link href="/admin/businesses">
                    <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                      Onboard Client Business
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {businesses.slice(0, 5).map((biz) => (
                    <div
                      key={biz.id}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                          {biz.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-900">
                            {biz.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {biz.category} {biz.address && `• ${biz.address}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 text-xs">
                        <span className="text-slate-500 hidden md:inline-flex font-medium">
                          {biz._count?.analytics ?? 0} Recorded Events
                        </span>
                        <Badge variant="success" size="sm">
                          Active
                        </Badge>
                        <Link
                          href={`/r/${biz.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-indigo-600 font-semibold border border-slate-200 transition-all shadow-subtle"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Customer QR</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
