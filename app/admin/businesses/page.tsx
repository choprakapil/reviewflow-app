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
  Loader2 
} from "lucide-react";
import Link from "next/link";

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

      const res = await fetch(`/api/admin/businesses?${params.toString()}`);
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
    if (!confirm("Are you sure you want to pause/archive this business?")) return;
    try {
      await fetch(`/api/admin/businesses/${id}/archive`, { method: "POST" });
      loadBusinesses();
    } catch {
      alert("Failed to archive business");
    }
  }

  async function restoreBusiness(id: string) {
    try {
      await fetch(`/api/admin/businesses/${id}/restore`, { method: "POST" });
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
      const res = await fetch(`/api/admin/businesses/${id}`, { method: "DELETE" });
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Client Establishments
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Manage business locations, AI review suggestions, and dynamic QR campaigns
          </p>
        </div>

        <CreateBusinessDialog onSuccess={loadBusinesses} />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by business name or category..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "ACTIVE"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Active Catalog
          </button>
          <button
            onClick={() => setStatusFilter("ARCHIVED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "ARCHIVED"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Business Table / Cards */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-sm">Loading client directory...</span>
          </div>
        ) : businesses.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              {statusFilter === "ACTIVE" ? "No Active Businesses Found" : "No Archived Businesses"}
            </h3>
            <p className="text-sm text-zinc-500 max-w-sm mt-1 mb-5">
              {statusFilter === "ACTIVE"
                ? "Onboard your first client establishment to start generating AI review suggestions."
                : "Businesses archived after contract conclusion appear here."}
            </p>
            {statusFilter === "ACTIVE" && <CreateBusinessDialog onSuccess={loadBusinesses} />}
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-base flex items-center justify-center shrink-0">
                    {biz.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                      <span>{biz.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-normal">
                        {biz.category}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                      <span>Slug: /r/{biz.slug}</span>
                      {biz.address && <span>• {biz.address}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    href={`/r/${biz.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300"
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>View QR Page</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </Link>

                  {/* Edit Button Dialog */}
                  <EditBusinessDialog business={biz} onSuccess={loadBusinesses} />

                  {/* Archive / Restore Button */}
                  {biz.status === "ACTIVE" ? (
                    <button
                      onClick={() => archiveBusiness(biz.id)}
                      className="p-2 text-zinc-400 hover:text-amber-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Archive / Pause Business"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => restoreBusiness(biz.id)}
                      className="p-2 text-zinc-400 hover:text-emerald-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Restore Business"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  {/* Hard Delete Button */}
                  <button
                    onClick={() => deleteBusiness(biz.id, biz.name)}
                    className="p-2 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Delete Business Permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
