"use client";

import { useState } from "react";
import { 
  Pencil, 
  X, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  Sparkles, 
  Building2, 
  RefreshCw,
  Check
} from "lucide-react";
import { validateGoogleReviewUrl } from "@/lib/utils/google-url";

export interface BusinessData {
  id: string;
  name: string;
  category: string;
  address?: string | null;
  googleReviewUrl: string;
  website?: string | null;
  phone?: string | null;
  keywords?: string[] | unknown;
  services?: string[] | unknown;
  aiConfig?: {
    reviewLength?: "SHORT" | "MEDIUM" | "LONG";
    writingStyle?: "NATURAL" | "PROFESSIONAL" | "ENTHUSIASTIC" | "SIMPLE";
    customPromptInstructions?: string | null;
    askCustomerQuestions?: boolean;
    poolTargetSize?: number;
  } | null;
}

interface EditBusinessDialogProps {
  business: BusinessData;
  onSuccess: () => void;
}

export function EditBusinessDialog({ business, onSuccess }: EditBusinessDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "ai">("general");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields - General
  const [name, setName] = useState(business.name);
  const [category, setCategory] = useState(business.category);
  const [address, setAddress] = useState(business.address || "");
  const [googleReviewUrl, setGoogleReviewUrl] = useState(business.googleReviewUrl);
  const [website, setWebsite] = useState(business.website || "");
  const [phone, setPhone] = useState(business.phone || "");

  // Keywords & Services tags
  const initialKeywords = Array.isArray(business.keywords) ? (business.keywords as string[]) : [];
  const initialServices = Array.isArray(business.services) ? (business.services as string[]) : [];

  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [serviceInput, setServiceInput] = useState("");
  const [services, setServices] = useState<string[]>(initialServices);

  // Form Fields - AI Configuration
  const [reviewLength, setReviewLength] = useState<"SHORT" | "MEDIUM" | "LONG">(
    business.aiConfig?.reviewLength || "MEDIUM"
  );
  const [writingStyle, setWritingStyle] = useState<"NATURAL" | "PROFESSIONAL" | "ENTHUSIASTIC" | "SIMPLE">(
    business.aiConfig?.writingStyle || "NATURAL"
  );
  const [customInstructions, setCustomInstructions] = useState(
    business.aiConfig?.customPromptInstructions || ""
  );
  const [askCustomerQuestions, setAskCustomerQuestions] = useState(
    business.aiConfig?.askCustomerQuestions ?? false
  );
  const [regenerateSuggestions, setRegenerateSuggestions] = useState(true);

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
      const res = await fetch(`/api/admin/businesses/${business.id}`, {
        method: "PATCH",
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
            customPromptInstructions: customInstructions || null,
            askCustomerQuestions,
          },
          regenerateSuggestions,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to update business");
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
        className="p-2 text-zinc-400 hover:text-blue-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        title="Edit Business & AI Settings"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Manage {business.name}</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Customize profile details, review length, writing style, and AI parameters
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === "general"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>General Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === "ai"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Review Settings</span>
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {activeTab === "general" ? (
                <>
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
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
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
                        placeholder="e.g. Website Designing, Website Development"
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
                      SEO Keywords & Staff Attributes (Press Enter to add)
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
                        placeholder="e.g. Friendly Staff, Professional Team"
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
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

                  {/* Row 6: Website & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Tab 2: AI Review Settings for this Business */
                <div className="space-y-5">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-3">
                    <Sparkles className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-0.5">Custom AI Tuning for {business.name}</span>
                      These settings directly influence how Gemini drafts reviews for this specific business location and its dynamic QR code.
                    </div>
                  </div>

                  {/* Length & Style */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                        Default Review Length
                      </label>
                      <select
                        value={reviewLength}
                        onChange={(e) => setReviewLength(e.target.value as "SHORT" | "MEDIUM" | "LONG")}
                        className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="SHORT">Short (1-2 sentences • Punchy &amp; Fast)</option>
                        <option value="MEDIUM">Medium (2-3 sentences • Recommended)</option>
                        <option value="LONG">Long (3-4 sentences • In-depth testimonial)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                        Default Writing Style
                      </label>
                      <select
                        value={writingStyle}
                        onChange={(e) => setWritingStyle(e.target.value as "NATURAL" | "PROFESSIONAL" | "ENTHUSIASTIC" | "SIMPLE")}
                        className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="NATURAL">Natural &amp; Conversational (Everyday customer)</option>
                        <option value="PROFESSIONAL">Professional &amp; Polished (B2B, Medical, Legal)</option>
                        <option value="ENTHUSIASTIC">Enthusiastic &amp; High Energy (Restaurants, Salons)</option>
                        <option value="SIMPLE">Simple &amp; Direct (Concise feedback)</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Prompt Instructions */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      Custom Prompt Instructions for AI
                    </label>
                    <textarea
                      rows={3}
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="e.g. Always emphasize our fast project turnaround, transparent pricing, and 24/7 dedicated support..."
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Additional directives passed directly to the Gemini model when generating reviews for this business.
                    </p>
                  </div>

                  {/* Customer Questionnaire Toggle */}
                  <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                        Customer Experience Questionnaire
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Let customers select which service they received before generating the review draft
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={askCustomerQuestions}
                        onChange={(e) => setAskCustomerQuestions(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Auto Regenerate Suggestions Checkbox */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="regenerateSuggestions"
                      checked={regenerateSuggestions}
                      onChange={(e) => setRegenerateSuggestions(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-zinc-300 focus:ring-blue-500"
                    />
                    <label htmlFor="regenerateSuggestions" className="text-xs text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer">
                      Regenerate suggestion pool immediately with new style &amp; length
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving &amp; Updating AI...</span>
                    </>
                  ) : (
                    <span>Save Business Settings</span>
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
