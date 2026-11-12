"use client";

import { useState, useEffect } from "react";
import { 
  Download, 
  Palette, 
  ExternalLink, 
  Printer, 
  Check, 
  Loader2,
  Sliders,
  Sparkles,
  Save
} from "lucide-react";

interface BusinessOption {
  id: string;
  name: string;
  slug: string;
}

export default function QRStudioPage() {
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");

  const [qrSvg, setQrSvg] = useState<string>("");
  const [pngDataUrl, setPngDataUrl] = useState<string>("");
  const [landingUrl, setLandingUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const res = await fetch("/api/admin/businesses");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setBusinesses(json.data);
          setSelectedId(json.data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch businesses:", err);
      }
    }
    fetchBusinesses();
  }, []);

  async function loadQR(idToLoad = selectedId) {
    if (!idToLoad) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/businesses/${idToLoad}/qr`);
      const json = await res.json();
      if (json.success) {
        setQrSvg(json.data.svg);
        setPngDataUrl(json.data.pngDataUrl);
        setLandingUrl(json.data.landingUrl);
        if (json.data.config) {
          setForegroundColor(json.data.config.foregroundColor || "#000000");
          setBackgroundColor(json.data.config.backgroundColor || "#FFFFFF");
        }
      }
    } catch (err) {
      console.error("Failed to load QR code:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (selectedId) {
      loadQR(selectedId);
    }
  }, [selectedId]);

  async function savePalette() {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/businesses/${selectedId}/qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foregroundColor, backgroundColor }),
      });
      const json = await res.json();
      if (json.success) {
        await loadQR(selectedId);
      }
    } catch (err) {
      console.error("Failed to save QR palette:", err);
    } finally {
      setIsSaving(false);
    }
  }

  function downloadSvg() {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reviewflow-qr-${selectedBusiness?.slug || "code"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPng() {
    if (!pngDataUrl) return;
    const a = document.createElement("a");
    a.href = pngDataUrl;
    a.download = `reviewflow-qr-${selectedBusiness?.slug || "code"}-1024.png`;
    a.click();
  }

  function printTableTent() {
    window.print();
  }

  const selectedBusiness = businesses.find((b) => b.id === selectedId);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-blue-600" />
          <span>Dynamic QR Studio & Print Center</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Customize high-contrast QR matrices, download vector SVGs, and print in-store collateral
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
              Select Client Business
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {businesses.map((biz) => (
                <option key={biz.id} value={biz.id}>
                  {biz.name} (/r/{biz.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600" />
              <span>Palette & Contrast</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 font-medium">
                  Foreground Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-zinc-200 cursor-pointer p-0.5 bg-white"
                  />
                  <span className="text-xs font-mono uppercase text-zinc-600 dark:text-zinc-400">
                    {foregroundColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 font-medium">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-zinc-200 cursor-pointer p-0.5 bg-white"
                  />
                  <span className="text-xs font-mono uppercase text-zinc-600 dark:text-zinc-400">
                    {backgroundColor}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={savePalette}
              disabled={isSaving || isLoading}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Matrix...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-blue-600" />
                  <span>Save QR Colors</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Permanent Dynamic Slug
            </h3>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs font-mono text-zinc-600 dark:text-zinc-300 break-all flex items-center justify-between">
              <span>{landingUrl || "Generating..."}</span>
              {selectedBusiness && (
                <a
                  href={`/r/${selectedBusiness.slug}`}
                  target="_blank"
                  className="text-blue-600 hover:text-blue-700 ml-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">
              Target Google review destination can be updated anytime without altering physical prints.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2.5">
            <button
              onClick={downloadSvg}
              disabled={isLoading || !qrSvg}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download Vector SVG (Print Shops)</span>
            </button>

            <button
              onClick={downloadPng}
              disabled={isLoading || !pngDataUrl}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 font-medium text-sm transition-all shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-zinc-500" />
              <span>Download 1024x1024 PNG</span>
            </button>

            <button
              onClick={printTableTent}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 font-medium text-sm transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-zinc-500" />
              <span>Print Countertop Table Tent Layout</span>
            </button>
          </div>
        </div>

        {/* Right Column: High-DPI Live Visual Preview */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col items-center text-center">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Generating vector QR preview...</span>
            </div>
          ) : qrSvg ? (
            <div className="max-w-sm w-full space-y-6">
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 bg-zinc-50 dark:bg-zinc-950/60 shadow-inner flex flex-col items-center">
                <div className="text-center mb-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ReviewFlow Table Card</span>
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {selectedBusiness?.name || "Business Name"}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Scan with your phone camera to share your review on Google!
                  </p>
                </div>

                {/* Render SVG cleanly inside responsive container */}
                <div
                  className="w-56 h-56 p-3 bg-white rounded-2xl shadow-md border border-zinc-200"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />

                <div className="mt-5 text-[11px] text-zinc-400 font-mono">
                  reviewflow.io/r/{selectedBusiness?.slug}
                </div>
              </div>

              <div className="text-xs text-zinc-500 flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Camera read tested up to 4 feet distance</span>
              </div>
            </div>
          ) : (
            <div className="py-24 text-zinc-400 text-sm">
              No business selected.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

