"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Download, 
  Palette, 
  ExternalLink, 
  Printer, 
  Loader2,
  Sliders,
  Save,
  Star,
  Layers,
  Type,
  ShieldCheck,
  Building2,
  Check
} from "lucide-react";
import { apiUrl } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface BusinessOption {
  id: string;
  name: string;
  slug: string;
  category: string;
  address?: string | null;
}

const PRESET_THEMES = [
  { name: "Classic Indigo", fg: "#4F46E5", bg: "#FFFFFF" },
  { name: "Monochrome Black", fg: "#0F172A", bg: "#FFFFFF" },
  { name: "Google Blue", fg: "#1A73E8", bg: "#FFFFFF" },
  { name: "Slate & Gold", fg: "#1E293B", bg: "#FFFBEB" },
  { name: "Emerald Health", fg: "#059669", bg: "#F0FDF4" },
  { name: "Modern Crimson", fg: "#E11D48", bg: "#FFF1F2" },
];

export default function QRStudioPage() {
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [foregroundColor, setForegroundColor] = useState("#4F46E5");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<"M" | "H">("H");
  const [cardTemplate, setCardTemplate] = useState<"TABLE_TENT" | "WINDOW_STICKER" | "CLEAN_CARD">("TABLE_TENT");
  const [headline, setHeadline] = useState("Loved your experience with us?");
  const [subHeadline, setSubHeadline] = useState("Scan with your phone camera to share your review on Google!");

  const [qrSvg, setQrSvg] = useState<string>("");
  const [pngDataUrl, setPngDataUrl] = useState<string>("");
  const [landingUrl, setLandingUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const res = await fetch(apiUrl("/api/admin/businesses"));
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

  const loadQR = useCallback(async (idToLoad: string, fg?: string, bg?: string) => {
    if (!idToLoad) return;
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/businesses/${idToLoad}/qr`));
      const json = await res.json();
      if (json.success) {
        setQrSvg(json.data.svg);
        setPngDataUrl(json.data.pngDataUrl);
        setLandingUrl(json.data.landingUrl);
        if (json.data.config) {
          setForegroundColor(fg || json.data.config.foregroundColor || "#4F46E5");
          setBackgroundColor(bg || json.data.config.backgroundColor || "#FFFFFF");
        }
      }
    } catch (err) {
      console.error("Failed to load QR code:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadQR(selectedId);
    }
  }, [selectedId, loadQR]);

  async function savePalette() {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/businesses/${selectedId}/qr`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          foregroundColor, 
          backgroundColor,
          errorCorrectionLevel 
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
        await loadQR(selectedId, foregroundColor, backgroundColor);
      }
    } catch (err) {
      console.error("Failed to save QR palette:", err);
    } finally {
      setIsSaving(false);
    }
  }

  function applyPreset(fg: string, bg: string) {
    setForegroundColor(fg);
    setBackgroundColor(bg);
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

  function printCollateral() {
    window.print();
  }

  const selectedBusiness = businesses.find((b) => b.id === selectedId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR Studio & Print Center"
        description="Design branded physical collateral, choose high-conversion display formats, and export vector prints."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Printer className="w-4 h-4 text-slate-500" />}
              onClick={printCollateral}
            >
              Print Card
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={downloadPng}
              disabled={isLoading || !pngDataUrl}
            >
              Export High-Res PNG
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration Controls */}
        <Card className="lg:col-span-5 p-6 space-y-6">
          {/* Select Business */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Select Client Establishment
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-subtle"
            >
              {businesses.map((biz) => (
                <option key={biz.id} value={biz.id}>
                  {biz.name} ({biz.category})
                </option>
              ))}
            </select>
          </div>

          {/* Display Template Layout */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Collateral Display Format</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCardTemplate("TABLE_TENT")}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  cardTemplate === "TABLE_TENT"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-subtle"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Table Tent
              </button>
              <button
                type="button"
                onClick={() => setCardTemplate("WINDOW_STICKER")}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  cardTemplate === "WINDOW_STICKER"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-subtle"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Window Stand
              </button>
              <button
                type="button"
                onClick={() => setCardTemplate("CLEAN_CARD")}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  cardTemplate === "CLEAN_CARD"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-subtle"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Clean Matrix
              </button>
            </div>
          </div>

          {/* Palette & Brand Presets */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" />
              <span>Palette & Brand Colors</span>
            </h3>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_THEMES.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => applyPreset(theme.fg, theme.bg)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/10"
                    style={{ backgroundColor: theme.fg }}
                  />
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>

            {/* Pickers */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <label className="block text-[11px] text-slate-500 font-medium">
                  Foreground Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white shadow-subtle"
                  />
                  <span className="text-xs font-mono uppercase text-slate-700 font-semibold">
                    {foregroundColor}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] text-slate-500 font-medium">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white shadow-subtle"
                  />
                  <span className="text-xs font-mono uppercase text-slate-700 font-semibold">
                    {backgroundColor}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={savePalette}
              disabled={isSaving || isLoading}
              isLoading={isSaving}
              leftIcon={isSaved ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4 text-indigo-600" />}
              className="w-full mt-2"
            >
              {isSaved ? "Saved to Campaign!" : "Apply & Save to Campaign"}
            </Button>
          </div>

          {/* Headline & Instructions */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-600" />
              <span>Card Headline & Copy</span>
            </h3>

            <div className="space-y-1.5">
              <label className="block text-[11px] text-slate-500 font-medium">
                Headline Text
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Loved your experience with us?"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] text-slate-500 font-medium">
                Subheadline Instructions
              </label>
              <input
                type="text"
                value={subHeadline}
                onChange={(e) => setSubHeadline(e.target.value)}
                placeholder="Scan the QR code to leave a quick 5-star Google review!"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Export Actions */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2.5">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Download className="w-3.5 h-3.5 text-slate-500" />}
              onClick={downloadSvg}
              disabled={isLoading || !qrSvg}
              className="w-full"
            >
              Vector SVG
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Download className="w-3.5 h-3.5 text-slate-500" />}
              onClick={downloadPng}
              disabled={isLoading || !pngDataUrl}
              className="w-full"
            >
              1024px PNG
            </Button>
          </div>
        </Card>

        {/* Right Column: Live Interactive Visual Canvas Preview */}
        <Card className="lg:col-span-7 p-6 sm:p-10 flex flex-col items-center justify-center text-center bg-slate-50/60 border-dashed border-2">
          {isLoading ? (
            <div className="py-28 flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="text-sm font-medium">Generating high-contrast preview...</span>
            </div>
          ) : qrSvg ? (
            <div className="max-w-md w-full space-y-6">
              {/* Table Tent Canvas */}
              <div 
                className="border border-slate-200 rounded-3xl p-8 shadow-card flex flex-col items-center transition-all"
                style={{ backgroundColor: backgroundColor }}
              >
                {/* 5-Star Header Badge */}
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <h2 
                  className="text-xl font-extrabold tracking-tight mb-1"
                  style={{ color: foregroundColor }}
                >
                  {headline}
                </h2>

                <p 
                  className="text-xs max-w-xs text-center mb-6 leading-relaxed opacity-90"
                  style={{ color: foregroundColor }}
                >
                  {subHeadline}
                </p>

                {/* QR Code Graphic Box */}
                <div className="p-4 bg-white rounded-2xl shadow-subtle border border-slate-100 flex items-center justify-center">
                  <div
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                    className="w-48 h-48 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                  />
                </div>

                {/* Business Info Footer */}
                <div className="mt-6 text-center space-y-1">
                  <div 
                    className="text-sm font-bold tracking-tight"
                    style={{ color: foregroundColor }}
                  >
                    {selectedBusiness?.name}
                  </div>
                  <div 
                    className="text-[11px] opacity-75 font-mono"
                    style={{ color: foregroundColor }}
                  >
                    reviewflow.io{landingUrl || `/r/${selectedBusiness?.slug}`}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Vector artwork preview automatically calibrated for 300 DPI high-speed print runs.
              </p>
            </div>
          ) : (
            <div className="py-20 text-slate-400 text-sm">Select a business to preview collateral</div>
          )}
        </Card>
      </div>
    </div>
  );
}
