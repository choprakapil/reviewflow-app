"use client";

import { useState } from "react";
import { ActionButton } from "./action-button";
import { RefreshCw, Edit3, ShieldCheck, Star } from "lucide-react";

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
  initialSuggestions: SuggestionItem[];
}

export function CustomerCard({
  businessName,
  category,
  address,
  googleReviewUrl,
  businessSlug,
  initialSuggestions,
}: CustomerCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentText, setCurrentText] = useState(
    initialSuggestions[0]?.suggestionText ||
      `I had an outstanding visit to ${businessName}. Professional staff, attentive service, and great results. Highly recommend!`
  );

  function cycleSuggestion() {
    if (initialSuggestions.length <= 1) return;
    const nextIndex = (currentIndex + 1) % initialSuggestions.length;
    setCurrentIndex(nextIndex);
    setCurrentText(initialSuggestions[nextIndex].suggestionText);
  }

  return (
    <div className="w-full max-w-[440px] mx-auto flex flex-col space-y-6">
      {/* 1. Header: Verified Business Branding */}
      <div className="text-center flex flex-col items-center">
        <div className="w-18 h-18 w-[72px] h-[72px] rounded-3xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/10 mb-3 border-2 border-white dark:border-zinc-800">
          {businessName.substring(0, 2).toUpperCase()}
        </div>

        <div className="flex items-center gap-1.5 justify-center">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {businessName}
          </h1>
          <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <CheckMarkIcon />
          </span>
        </div>

        <p className="text-xs text-zinc-500 mt-0.5">
          {category} {address && `• ${address.split(",")[0]}`}
        </p>

        <div className="flex items-center gap-1 mt-2 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 ml-1">
            Google Reviews
          </span>
        </div>
      </div>

      {/* 2. Intro Helper Text */}
      <div className="text-center px-2">
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
          We appreciate your visit today! Here is a personalized draft to make sharing your review on Google effortless:
        </p>
      </div>

      {/* 3. Hero Element: Review Suggestion Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-3 relative group">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <span className="font-medium text-zinc-500 uppercase tracking-wider">
            Suggested Review Draft
          </span>
          <span className="inline-flex items-center gap-1 text-zinc-400">
            <Edit3 className="w-3 h-3" />
            <span>Tap text to customize</span>
          </span>
        </div>

        {/* Editable Review Textarea */}
        <textarea
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          rows={4}
          className="w-full text-base leading-relaxed text-zinc-800 dark:text-zinc-200 bg-transparent resize-none focus:outline-none focus:ring-0 font-sans"
        />

        {/* Cycle Alternative Suggestion */}
        {initialSuggestions.length > 1 && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button
              onClick={cycleSuggestion}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 py-1 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Try another suggestion</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Primary Sticky CTA Button (56px Touch Target) */}
      <div className="sticky bottom-4 z-20 pt-2">
        <ActionButton
          reviewText={currentText}
          googleReviewUrl={googleReviewUrl}
          businessSlug={businessSlug}
        />
      </div>

      {/* 5. Google Policy & Legal Compliance Disclaimer */}
      <div className="text-center px-4 pt-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <p className="leading-tight">
            This draft is provided for convenience. You can freely edit or replace it with your genuine experience on Google.
          </p>
        </div>
      </div>
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

