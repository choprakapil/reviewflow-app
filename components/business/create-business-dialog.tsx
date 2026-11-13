"use client";

import { useState } from "react";
import { Plus, Check, AlertCircle, Loader2, Sparkles, ExternalLink, Tag } from "lucide-react";
import { validateGoogleReviewUrl } from "@/lib/utils/google-url";
import { apiUrl } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      const res = await fetch(apiUrl("/api/admin/businesses"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          address: address || undefined,
          website: website || undefined,
          phone: phone || undefined,
          googleReviewUrl,
          keywords: finalKeywords,
          services: finalServices,
          aiConfig: {
            reviewLength,
            writingStyle,
            modelName: "gemini-3.5-flash-lite",
            askCustomerQuestions: false,
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
      setError(err instanceof Error ? err.message : "Failed to create business");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="primary"
        size="md"
        leftIcon={<Plus className="w-4 h-4" />}
        onClick={() => setIsOpen(true)}
      >
        Onboard Business
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Onboard Client Business"
        description="Configure client profile, Google review URL, and auto-generate dynamic QR code."
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
              form="create-business-form"
              variant="primary"
              size="md"
              isLoading={isLoading}
            >
              Create Business & QR Code
            </Button>
          </div>
        }
      >
        {error && (
          <div className="mb-5 flex items-center gap-2.5 p-3.5 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form id="create-business-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Name & Category */}
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
                placeholder="e.g. Apex Dental Studio"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Industry Category *
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Dentistry, Cafe, Auto Repair"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Google Review URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Google Review URL *
              </label>
              {googleReviewUrl && (
                <button
                  type="button"
                  onClick={testGoogleUrl}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
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
              placeholder="https://search.google.com/local/writereview?placeid=..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400">
              Must be an official Google Place ID review link or verified g.page shortlink.
            </p>
          </div>

          {/* Row 3: Address & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Market St, Suite 400"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Business Phone / Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://clientwebsite.com"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Services Offered Chips */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Key Services (for AI Review Prompts)
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
                placeholder="Type service (e.g. Teeth Whitening) and press Add"
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

          {/* Keywords Input Chips */}
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

          {/* AI Defaults for this business */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Default Review Length
              </label>
              <select
                value={reviewLength}
                onChange={(e) => setReviewLength(e.target.value as "SHORT" | "MEDIUM" | "LONG")}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              >
                <option value="SHORT">Short (20-40 words, 1-2 sentences)</option>
                <option value="MEDIUM">Medium (50-80 words, 3-4 sentences)</option>
                <option value="LONG">Long (100-140 words, comprehensive)</option>
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
                <option value="ENTHUSIASTIC">Enthusiastic & Warm</option>
                <option value="SIMPLE">Simple & Direct</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
