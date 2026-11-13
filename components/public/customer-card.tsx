"use client";

import { useState } from "react";
import { ActionButton } from "./action-button";
import { RefreshCw, Edit3, ShieldCheck, Sparkles, Check, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuggestionItem {
  id: string;
  suggestionText: string;
  targetedService?: string | null;
}

interface CustomerCardProps {
  businessName: string;
  category: string;
  address?: string | null;
  googleReviewUrl: string;
  businessSlug: string;
  services?: string[];
  askCustomerQuestions?: boolean;
  initialSuggestions: SuggestionItem[];
}

const COMMON_HIGHLIGHT_SUGGESTIONS = [
  "Friendly & attentive staff",
  "Prompt, on-time service",
  "High quality & thorough work",
  "Clear explanations & honest advice",
  "Clean, modern atmosphere",
  "Great customer service",
];

export function CustomerCard({
  businessName,
  category,
  address,
  googleReviewUrl,
  businessSlug,
  services = [],
  askCustomerQuestions = false,
  initialSuggestions,
}: CustomerCardProps) {
  // If questions are required, start in "questionnaire" mode; otherwise start in "ready" mode
  const [hasGenerated, setHasGenerated] = useState(!askCustomerQuestions);
  const [selectedService, setSelectedService] = useState<string>("");
  const [customService, setCustomService] = useState<string>("");
  const [selectedHighlight, setSelectedHighlight] = useState<string>("");
  const [customHighlight, setCustomHighlight] = useState<string>("");
  const [variationIndex, setVariationIndex] = useState(0);

  const fallbackDefault =
    initialSuggestions[0]?.suggestionText ||
    `Had a great experience with ${businessName}! The team was very professional, friendly, and easy to work with. Highly recommend their services!`;

  const [currentText, setCurrentText] = useState(fallbackDefault);

  // Helper to compose personalized review draft
  function buildPersonalizedDraft(service: string, highlight: string, variant = 0): string {
    const s = service.trim();
    const h = highlight.trim().toLowerCase();

    if (s && h) {
      const templates = [
        `I had a great experience with ${businessName} for ${s}! Their team was ${h}, and the entire process was smooth, professional, and transparent. Highly recommend them to anyone looking for quality work!`,
        `Really impressed with ${businessName} when I visited for ${s}. What stood out to me most was how ${h} everyone was throughout my visit. Definitely a 5-star experience all around!`,
        `Top-notch experience with ${businessName}! They helped me with ${s}, and their staff was ${h}. Very satisfied with the outcome and would gladly recommend them!`,
      ];
      return templates[variant % templates.length];
    }

    if (s) {
      const templates = [
        `I visited ${businessName} for ${s} and was very impressed with their service! The team was friendly, professional, and very thorough. Definitely recommend them to anyone looking for dependable service.`,
        `Really pleased with the quality of work from ${businessName} regarding ${s}. The staff was welcoming, communication was clear, and everything went smoothly from start to finish!`,
        `Had a seamless experience with ${businessName} for ${s}. Prompt, knowledgeable team and great attention to detail throughout. A solid 5 stars!`,
      ];
      return templates[variant % templates.length];
    }

    if (h) {
      const templates = [
        `Had a wonderful experience with ${businessName}! Their team was ${h}, and everything was handled with great care and professionalism. Highly recommended!`,
        `Really impressed by the customer service at ${businessName}. What stood out to me most was how ${h} the entire team was. Definitely worth recommending!`,
        `Great visit to ${businessName}. The staff was ${h} and made the whole process easy and stress-free. Very happy with the service!`,
      ];
      return templates[variant % templates.length];
    }

    // Default to business suggestions or base template
    if (initialSuggestions.length > 0) {
      return initialSuggestions[variant % initialSuggestions.length].suggestionText;
    }
    return fallbackDefault;
  }

  // Generate review upon completing questionnaire
  function handleGenerateReview() {
    const activeService = selectedService || customService;
    const activeHighlight = customHighlight || selectedHighlight;
    const draft = buildPersonalizedDraft(activeService, activeHighlight, variationIndex);
    setCurrentText(draft);
    setHasGenerated(true);
  }

  // Cycle alternative draft variation
  function cycleVariation() {
    const nextVar = variationIndex + 1;
    setVariationIndex(nextVar);
    const activeService = selectedService || customService;
    const activeHighlight = customHighlight || selectedHighlight;
    const draft = buildPersonalizedDraft(activeService, activeHighlight, nextVar);
    setCurrentText(draft);
  }

  return (
    <div className="w-full flex flex-col space-y-5">
      {/* 1. Verified Business Header Branding */}
      <div className="text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-md mb-3 border-2 border-white ring-4 ring-indigo-50">
          {businessName.substring(0, 2).toUpperCase()}
        </div>

        <div className="flex items-center gap-1.5 justify-center">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {businessName}
          </h1>
          <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <CheckMarkIcon />
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-0.5">
          {category} {address && `• ${address.split(",")[0]}`}
        </p>

        <div className="flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-subtle">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[11px] font-semibold">Official Google Review Assistant</span>
        </div>
      </div>

      {/* 2. Questionnaire Mode (When askCustomerQuestions is true and draft not yet generated or being edited) */}
      {askCustomerQuestions && !hasGenerated && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-5 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
              <h2 className="text-sm font-bold text-slate-900">
                Which service did you receive?
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-8">
              Select from the options below or type your own
            </p>

            <div className="mt-3 ml-8 space-y-2">
              {services.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {services.map((svc) => {
                    const isSelected = selectedService === svc && !customService;
                    return (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => {
                          setSelectedService(isSelected ? "" : svc);
                          setCustomService("");
                        }}
                        className={`text-xs px-3.5 py-2 rounded-xl border font-medium transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                        }`}
                      >
                        {svc}
                      </button>
                    );
                  })}
                </div>
              )}

              <input
                type="text"
                placeholder={services.length > 0 ? "Or type other service..." : "e.g. Routine consultation, Repair, etc."}
                value={customService}
                onChange={(e) => {
                  setCustomService(e.target.value);
                  if (e.target.value) setSelectedService("");
                }}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">2</span>
              <h2 className="text-sm font-bold text-slate-900">
                What stood out to you personally?
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-8">
              Select a highlight or type your thoughts
            </p>

            <div className="mt-3 ml-8 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {COMMON_HIGHLIGHT_SUGGESTIONS.map((hl) => {
                  const isSelected = selectedHighlight === hl && !customHighlight;
                  return (
                    <button
                      key={hl}
                      type="button"
                      onClick={() => {
                        setSelectedHighlight(isSelected ? "" : hl);
                        setCustomHighlight("");
                      }}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 font-semibold shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {hl}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                placeholder="Or type what stood out (e.g. friendly staff, fast check-in)"
                value={customHighlight}
                onChange={(e) => {
                  setCustomHighlight(e.target.value);
                  if (e.target.value) setSelectedHighlight("");
                }}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleGenerateReview}
              className="w-full font-bold shadow-md"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>✨ Generate My Review Draft</span>
            </Button>

            <button
              type="button"
              onClick={() => {
                setCurrentText(fallbackDefault);
                setHasGenerated(true);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 py-1 font-medium transition-colors text-center"
            >
              Skip questions and use general review &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 3. Review Draft Card & CTA (Visible when review is ready) */}
      {hasGenerated && (
        <div className="space-y-5 animate-in fade-in">
          {/* Active Filters Pill Bar (when custom answers were provided) */}
          {askCustomerQuestions && (selectedService || customService || selectedHighlight || customHighlight) && (
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-indigo-900">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="font-semibold truncate">
                  Tailored to: {selectedService || customService || "General"}
                  {(selectedHighlight || customHighlight) && ` • ${selectedHighlight || customHighlight}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasGenerated(false)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 shrink-0 ml-2 underline"
              >
                Change Answers
              </button>
            </div>
          )}

          {/* Hero Editable Review Suggestion Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-3 relative group">
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-100 pb-2.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Suggested Review Draft</span>
              </span>
              <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 font-medium">
                <Edit3 className="w-3 h-3" />
                <span>Tap to edit</span>
              </span>
            </div>

            {/* Editable Review Textarea */}
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              rows={4}
              aria-label="Review draft text"
              className="w-full text-sm sm:text-base leading-relaxed text-slate-800 bg-transparent resize-none focus:outline-none focus:ring-0 font-sans"
            />

            {/* Cycle / Variation Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              {askCustomerQuestions ? (
                <button
                  type="button"
                  onClick={() => setHasGenerated(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-slate-50"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Edit Answers</span>
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={cycleVariation}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-1 px-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try another draft variation</span>
              </button>
            </div>
          </div>

          {/* 4. Primary Sticky CTA Button (56px Touch Target) */}
          <div className="sticky bottom-4 z-20 pt-1">
            <ActionButton
              reviewText={currentText}
              googleReviewUrl={googleReviewUrl}
              businessSlug={businessSlug}
            />
          </div>

          {/* 5. Google Policy & Legal Compliance Disclaimer */}
          <div className="text-center px-3 pt-1">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <p className="leading-tight">
                This draft is provided for convenience. You can freely edit or replace it with your genuine experience on Google.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckMarkIcon() {
  return (
    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
    </svg>
  );
}
