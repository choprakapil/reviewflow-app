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
  Save,
  Star,
  Layers,
  Type,
  ShieldAlert
} from "lucide-react";

interface BusinessOption {
  id: string;
  name: string;
  slug: string;
  category: string;
  address?: string | null;
}

const PRESET_THEMES = [
  { name: "Classic Monochrome", fg: "#000000", bg: "#FFFFFF" },
  { name: "Google Blue", fg: "#1A73E8", bg: "#FFFFFF" },
  { name: "Charcoal & Gold", fg: "#18181B", bg: "#FFFBEB" },
  { name: "Emerald Clinic", fg: "#059669", bg: "#F0FDF4" },
  { name: "Royal Purple", fg: "#7C3AED", bg: "#FAF5FF" },
  { name: "Modern Crimson", fg: "#DC2626", bg: "#FEF2F2" },
];

export default function QRStudioPage() {
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<"M" | "H">("H");
  const [cardTemplate, setCardTemplate] = useState<"TABLE_TENT" | "WINDOW_STICKER" | "CLEAN_CARD">("TABLE_TENT");
  const [headline, setHeadline] = useState("Loved your experience with us?");
  const [subHeadline, setSubHeadline] = useState("Scan the QR code with your smartphone camera to share your 5-star review on Google!");

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

  async function loadQR(idToLoad = selectedId, fg = foregroundColor, bg = backgroundColor, ec = errorCorrectionLevel) {
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
          setForegroundColor(fg || json.data.config.foregroundColor || "#000000");
          setBackgroundColor(bg || json.data.config.backgroundColor || "#FFFFFF");
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
        body: JSON.stringify({ 
          foregroundColor, 
          backgroundColor,
          errorCorrectionLevel 
        }),
      });
      const json = await res.json();
      if (json.success) {
        await loadQR(selectedId, foregroundColor, backgroundColor, errorCorrectionLevel);
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-blue-600" />
          <span>Advanced QR Studio &amp; Print Center</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Customize branded QR collateral, choose high-conversion table tent templates, and export vector prints
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          {/* Select Business */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
              Select Client Establishment
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {businesses.map((biz) => (
                <option key={biz.id} value={biz.id}>
                  {biz.name} ({biz.category})
                </option>
              ))}
            </select>
          </div>

          {/* Section 1: Template Format */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Collateral Display Layout</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCardTemplate("TABLE_TENT")}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  cardTemplate === "TABLE_TENT"
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 shadow-sm"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                }`}
              >
                Table Tent
              </button>
              <button
                type="button"
                onClick={() => setCardTemplate("WINDOW_STICKER")}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  cardTemplate === "WINDOW_STICKER"
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 shadow-sm"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                }`}
              >
                Window Sticker
              </button>
              <button
                type="button"
                onClick={() => setCardTemplate("CLEAN_CARD")}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  cardTemplate === "CLEAN_CARD"
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 shadow-sm"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                }`}
              >
                Minimal Matrix
              </button>
            </div>
          </div>

          {/* Section 2: Color Palette & Presets */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600" />
              <span>Palette &amp; Brand Styling</span>
            </h3>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_THEMES.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => applyPreset(theme.fg, theme.bg)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: theme.fg }}></span>
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>

            {/* Custom Pickers */}
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
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Business Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-blue-600" />
                  <span>Apply &amp; Save Colors</span>
                </>
              )}
            </button>
          </div>

          {/* Section 3: Headline & Call To Action Customization */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-blue-600" />
              <span>Card Headline &amp; Subtitle</span>
            </h3>

            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">
                Headline Text
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Loved your experience with us?"
                className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">
                Subheadline Instructions
              </label>
              <input
                type="text"
                value={subHeadline}
                onChange={(e) => setSubHeadline(e.target.value)}
                placeholder="Scan the QR code to leave a quick 5-star Google review!"
                className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Section 4: Print & Downloads */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2.5">
            <button
              onClick={printCollateral}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Branded Table Collateral</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={downloadSvg}
                disabled={isLoading || !qrSvg}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 font-medium text-xs transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Vector SVG</span>
              </button>

              <button
                onClick={downloadPng}
                disabled={isLoading || !pngDataUrl}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 font-medium text-xs transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>1024px PNG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: High-DPI Live Interactive Visual Preview */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col items-center text-center">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Generating high-contrast preview...</span>
            </div>
          ) : qrSvg ? (
            <div className="max-w-md w-full space-y-6">
              {/* Table Tent Layout */}
              {cardTemplate === "TABLE_TENT" && (
                <div 
                  className="border-2 border-zinc-300 dark:border-zinc-700 rounded-3xl p-8 shadow-xl flex flex-col items-center transition-all"
                  style={{ backgroundColor: backgroundColor }}
                >
                  {/* Google 5-Star Header Badge */}
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

                  <p className="text-xs text-zinc-500 max-w-xs mb-6">
                    {subHeadline}
                  </p>

                  {/* QR Matrix */}
                  <div
                    className="w-56 h-56 p-3 bg-white rounded-2xl shadow-md border border-zinc-200"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />

                  {/* Establishment Brand Badge */}
                  <div className="mt-6 flex flex-col items-center">
                    <span 
                      className="text-sm font-bold tracking-tight"
                      style={{ color: foregroundColor }}
                    >
                      {selectedBusiness?.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-0.5">
                      {selectedBusiness?.category} {selectedBusiness?.address && `• ${selectedBusiness.address}`}
                    </span>
                  </div>

                  <div className="mt-4 px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-mono">
                    Direct Tap: reviewflow.io/r/{selectedBusiness?.slug}
                  </div>
                </div>
              )}

              {/* Window Sticker Layout */}
              {cardTemplate === "WINDOW_STICKER" && (
                <div 
                  className="border-4 border-blue-600 rounded-3xl p-8 shadow-2xl flex flex-col items-center bg-white"
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
                    <span>Google Reviews</span>
                  </div>

                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                    REVIEW US HERE
                  </h2>

                  <div className="flex items-center gap-1 my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <div
                    className="w-52 h-52 p-3 bg-white rounded-xl shadow-inner border my-4"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />

                  <div className="text-xs font-bold text-zinc-800">
                    {selectedBusiness?.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Scan with any smartphone camera
                  </div>
                </div>
              )}

              {/* Minimal Clean Card Layout */}
              {cardTemplate === "CLEAN_CARD" && (
                <div 
                  className="border border-zinc-200 rounded-3xl p-8 shadow-sm flex flex-col items-center"
                  style={{ backgroundColor: backgroundColor }}
                >
                  <div
                    className="w-60 h-60 p-4 bg-white rounded-2xl shadow-sm border border-zinc-100"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                  <div 
                    className="mt-4 text-xs font-semibold"
                    style={{ color: foregroundColor }}
                  >
                    /r/{selectedBusiness?.slug}
                  </div>
                </div>
              )}

              <div className="text-xs text-zinc-500 flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Verified high-contrast matrix • Scans up to 4 feet distance</span>
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
