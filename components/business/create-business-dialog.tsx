"use client";

import { useState } from "react";
import { Plus, X, Check, AlertCircle, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { validateGoogleReviewUrl } from "@/lib/utils/google-url";

interface CreateBusinessDialogProps {
  onSuccess: () => void;
}

export function CreateBusinessDialog({ onSuccess }: CreateBusinessDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");

  // Keyword & Service Tag Inputs
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState("");
  const [services, setServices] = useState<string[]>([]);

  // AI Configuration for this business
  const [reviewLength, setReviewLength] = useState<"SHORT" | "MEDIUM" | "LONG">("MEDIUM");
  const [writingStyle, setWritingStyle] = useState<"NATURAL" | "PROFESSIONAL" | "ENTHUSIASTIC" | "SIMPLE">("NATURAL");

  function addKeyword() {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  }

  function removeKeyword(tag: string) {
    setKeywords(keywords.filter((k) => k !== tag));
  }

  function addService() {
    if (serviceInput.trim() && !services.includes(serviceInput.trim())) {
      setServices([...services, serviceInput.trim()]);
      setServiceInput("");
    }
  }

  function removeService(tag: string) {
    setServices(services.filter((s) => s !== tag));
  }

  function testGoogleUrl() {
    const val = validateGoogleReviewUrl(googleReviewUrl);
    if (!val.isValid) {
      alert("Invalid Google URL: " + val.error);
      return;
    }
    window.open(googleReviewUrl, "_blank");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const val = validateGoogleReviewUrl(googleReviewUrl);
    if (!val.isValid) {
      setError(val.error || "Please enter a valid Google review URL");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          address: address || undefined,
          website: website || undefined,
          phone: phone || undefined,
          googleReviewUrl,
          googlePlaceId: val.placeId || undefined,
          keywords,
          services,
          aiConfig: {
            reviewLength,
            writingStyle,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to create business");
      }

      setIsOpen(false);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Add Client Business</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Onboard New Client Business
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Configure Google review link, AI tuning, and generate permanent QR code
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Apex Cosmetic Dental"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Dentistry, Auto Detailing, Cafe..."
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Google Review URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Direct Google Review URL *
                  </label>
                  {googleReviewUrl && (
                    <button
                      type="button"
                      onClick={testGoogleUrl}
                      className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Test Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  required
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=... or https://g.page/r/.../review"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Obtained from Google Business Profile manager under &quot;Get more reviews&quot;
                </p>
              </div>

              {/* Row 3: Physical Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                  Venue Physical Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="124 Market St, Suite 200, San Francisco, CA"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Row 4: Services Tag Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                  Core Services Highlighted (Press Enter to add)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addService();
                      }
                    }}
                    placeholder="e.g. Teeth Whitening, Routine Cleaning"
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addService}
                    className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-xs font-medium rounded-xl hover:bg-zinc-200"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {services.map((svc) => (
                    <span
                      key={svc}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                    >
                      <span>{svc}</span>
                      <button
                        type="button"
                        onClick={() => removeService(svc)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Row 5: SEO Keywords Tag Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                  SEO Keywords for AI Inclusion
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    placeholder="e.g. friendly staff, gentle dentist"
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-xs font-medium rounded-xl hover:bg-zinc-200"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    >
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => removeKeyword(kw)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Row: AI Review Settings for this Business */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-white">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>AI Review Generation Tuning</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                      Review Length
                    </label>
                    <select
                      value={reviewLength}
                      onChange={(e) => setReviewLength(e.target.value as "SHORT" | "MEDIUM" | "LONG")}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="SHORT">Short (1-2 sentences)</option>
                      <option value="MEDIUM">Medium (2-3 sentences)</option>
                      <option value="LONG">Long (3-4 sentences)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                      Writing Style
                    </label>
                    <select
                      value={writingStyle}
                      onChange={(e) => setWritingStyle(e.target.value as "NATURAL" | "PROFESSIONAL" | "ENTHUSIASTIC" | "SIMPLE")}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="NATURAL">Natural &amp; Conversational</option>
                      <option value="PROFESSIONAL">Professional &amp; Polished</option>
                      <option value="ENTHUSIASTIC">Enthusiastic &amp; High Praise</option>
                      <option value="SIMPLE">Simple &amp; Direct</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating QR & AI Setup...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Save Business & Generate QR</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

