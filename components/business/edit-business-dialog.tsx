"use client";

import { useState } from "react";
import { 
  Pencil, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  Sparkles, 
  Building2, 
  Check,
  QrCode
} from "lucide-react";
import { validateGoogleReviewUrl } from "@/lib/utils/google-url";
import { apiUrl } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

    const finalServices = [...services];
    if (serviceInput.trim() && !finalServices.includes(serviceInput.trim())) {
      finalServices.push(serviceInput.trim());
      setServices(finalServices);
      setServiceInput("");
    }

    const finalKeywords = [...keywords];
    if (keywordInput.trim() && !finalKeywords.includes(keywordInput.trim())) {
      finalKeywords.push(keywordInput.trim());
      setKeywords(finalKeywords);
      setKeywordInput("");
    }

    setIsLoading(true);

    try {
      const res = await fetch(apiUrl(`/api/admin/businesses/${business.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          address: address || undefined,
          googleReviewUrl,
          website: website || undefined,
          phone: phone || undefined,
          keywords: finalKeywords,
          services: finalServices,
          regenerateSuggestions: true,
          aiConfig: {
            reviewLength,
            writingStyle,
            customPromptInstructions: customInstructions || null,
            askCustomerQuestions,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to update business");
      }

      setIsOpen(false);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update business");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        title="Edit Business Settings"
      >
        <Pencil className="w-4 h-4 text-slate-500 hover:text-slate-800" />
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Edit ${business.name}`}
        description="Update Google Review link, key services, and AI generation parameters."
        maxWidth="2xl"
        footer={
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-business-form"
              variant="primary"
              size="md"
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        {/* Modal Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "general"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            General Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "ai"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            AI Review Tuning
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2.5 p-3.5 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form id="edit-business-form" onSubmit={handleSubmit} className="space-y-5">
          {activeTab === "general" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Google Review Destination URL *
                  </label>
                  {googleReviewUrl && (
                    <button
                      type="button"
                      onClick={testGoogleUrl}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                    >
                      <span>Test Live Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  required
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Service Offerings */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Targeted Services
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
                    placeholder="Add service tag and press Add"
                    className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                  <Button type="button" variant="secondary" size="md" onClick={addService}>
                    Add
                  </Button>
                </div>
                {services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {services.map((svc) => (
                      <Badge key={svc} variant="default" size="md">
                        <span>{svc}</span>
                        <button
                          type="button"
                          onClick={() => removeService(svc)}
                          className="ml-1 text-slate-400 hover:text-rose-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Targeted Keywords for AI Review Prompts */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Targeted Keywords (for AI Review Generation)
                  </label>
                  <span className="text-[11px] text-slate-400">Press Enter or Add</span>
                </div>
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
                    placeholder="e.g. professional team, fast delivery, quality work"
                    className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                  <Button type="button" variant="secondary" size="md" onClick={addKeyword}>
                    Add
                  </Button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {keywords.map((kw) => (
                      <Badge key={kw} variant="brand" size="md">
                        <span>{kw}</span>
                        <button
                          type="button"
                          onClick={() => removeKeyword(kw)}
                          className="ml-1 text-indigo-300 hover:text-white"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Optional Questionnaire Toggle */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-slate-900">
                      Customer Experience Questionnaire
                    </span>
                    <p className="text-xs text-slate-500">
                      When enabled, visitors can answer optional questions (service, staff, highlight) to personalize their draft.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={askCustomerQuestions}
                      onChange={(e) => setAskCustomerQuestions(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Default Review Length
                  </label>
                  <select
                    value={reviewLength}
                    onChange={(e) => setReviewLength(e.target.value as "SHORT" | "MEDIUM" | "LONG")}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  >
                    <option value="SHORT">Short (20-40 words)</option>
                    <option value="MEDIUM">Medium (50-80 words)</option>
                    <option value="LONG">Long (100-140 words)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Default Writing Style
                  </label>
                  <select
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value as "NATURAL" | "PROFESSIONAL" | "ENTHUSIASTIC" | "SIMPLE")}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  >
                    <option value="NATURAL">Natural & Conversational</option>
                    <option value="PROFESSIONAL">Professional & Polite</option>
                    <option value="ENTHUSIASTIC">Enthusiastic & High Energy</option>
                    <option value="SIMPLE">Simple & Direct</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Custom Prompt Guidance (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Highlight modern sedation options, state-of-the-art cleanliness..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            </div>
          )}
        </form>
      </Modal>
    </>
  );
}
