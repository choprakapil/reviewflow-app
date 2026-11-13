"use client";

import { useState, useEffect, useCallback } from "react";
import { CreateBusinessDialog } from "@/components/business/create-business-dialog";
import { EditBusinessDialog } from "@/components/business/edit-business-dialog";
import { 
  Building2, 
  Search, 
  ExternalLink, 
  QrCode, 
  Archive, 
  RotateCcw, 
  Trash2, 
  Loader2,
  Sliders,
  MapPin,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { apiUrl } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface BusinessItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  googleReviewUrl: string;
  keywords?: string[] | unknown;
  services?: string[] | unknown;
  aiConfig?: {
    reviewLength?: "SHORT" | "MEDIUM" | "LONG";
    writingStyle?: "NATURAL" | "PROFESSIONAL" | "ENTHUSIASTIC" | "SIMPLE";
    customPromptInstructions?: string | null;
    askCustomerQuestions?: boolean;
    poolTargetSize?: number;
  } | null;
  qrCode?: {
    permanentShortUrl: string;
    isActive: boolean;
  };
  _count?: {
    suggestions: number;
    analytics: number;
  };
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");

  const loadBusinesses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(apiUrl(`/api/admin/businesses?${params.toString()}`));
      const json = await res.json();
      if (json.success) {
        setBusinesses(json.data);
      }
    } catch (err) {
      console.error("Failed to load businesses:", err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  async function archiveBusiness(id: string) {
    if (!confirm("Are you sure you want to pause/archive this business campaign?")) return;
    try {
      await fetch(apiUrl(`/api/admin/businesses/${id}/archive`), { method: "POST" });
      loadBusinesses();
    } catch {
      alert("Failed to archive business");
    }
  }

  async function restoreBusiness(id: string) {
    try {
      await fetch(apiUrl(`/api/admin/businesses/${id}/restore`), { method: "POST" });
      loadBusinesses();
    } catch {
      alert("Failed to restore business");
    }
  }

  async function deleteBusiness(id: string, name: string) {
    if (
      !confirm(
        `Are you sure you want to PERMANENTLY delete "${name}"?\n\nThis will remove all generated review suggestions, dynamic QR codes, and analytics tracking. This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(apiUrl(`/api/admin/businesses/${id}`), { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to delete business");
      }
      loadBusinesses();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete business");
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Client Establishments"
        description="Manage commercial profiles, Google Review URLs, tailored AI prompts, and dynamic QR campaigns."
        actions={<CreateBusinessDialog onSuccess={loadBusinesses} />}
      />

      {/* 2. Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by business name or category..."
              className="w-full pl-9.5 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-subtle"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center border border-slate-200/60">
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "ACTIVE"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Active Profiles ({statusFilter === "ACTIVE" ? businesses.length : "•"})
            </button>
            <button
              onClick={() => setStatusFilter("ARCHIVED")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "ARCHIVED"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Archived ({statusFilter === "ARCHIVED" ? businesses.length : "•"})
            </button>
          </div>
        </div>
      </Card>

      {/* 3. Business Table / Cards */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
            <span className="text-sm font-medium text-slate-500">Loading client directory...</span>
          </div>
        ) : businesses.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {statusFilter === "ACTIVE" ? "No Active Businesses Found" : "No Archived Businesses"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">
              {statusFilter === "ACTIVE"
                ? "Onboard your first client establishment to automatically provision dynamic QR codes and tailored AI review suggestions."
                : "Businesses archived after contract conclusion or campaign completion appear here."}
            </p>
            {statusFilter === "ACTIVE" && <CreateBusinessDialog onSuccess={loadBusinesses} />}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-sm flex items-center justify-center shrink-0 shadow-subtle">
                    {biz.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{biz.name}</span>
                      <Badge variant="default" size="sm">
                        {biz.category}
                      </Badge>
                      {biz.status === "ACTIVE" ? (
                        <Badge variant="success" size="sm" className="hidden sm:inline-flex">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Archived
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        /r/{biz.slug}
                      </span>
                      {biz.address && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3" />
                          <span>{biz.address}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <Link
                    href={`/r/${biz.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-indigo-600 shadow-subtle transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View Live QR</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>

                  {/* Edit Dialog */}
                  <EditBusinessDialog business={biz} onSuccess={loadBusinesses} />

                  {/* Archive / Restore */}
                  {biz.status === "ACTIVE" ? (
                    <button
                      onClick={() => archiveBusiness(biz.id)}
                      className="p-2 text-slate-400 hover:text-amber-600 rounded-xl hover:bg-slate-100 transition-colors"
                      title="Archive / Pause Campaign"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => restoreBusiness(biz.id)}
                      className="p-2 text-slate-400 hover:text-emerald-600 rounded-xl hover:bg-slate-100 transition-colors"
                      title="Restore Campaign"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => deleteBusiness(biz.id, biz.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors"
                    title="Delete Business Permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
