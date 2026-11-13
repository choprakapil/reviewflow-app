"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, AlertCircle, X, Sparkles, MousePointerClick } from "lucide-react";
import { apiUrl } from "@/lib/utils";

interface ActionButtonProps {
  reviewText: string;
  googleReviewUrl: string;
  businessSlug: string;
}

export function ActionButton({ reviewText, googleReviewUrl, businessSlug }: ActionButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showPasteGuide, setShowPasteGuide] = useState(false);

  async function handleCopyAndRedirect() {
    let copySuccess = false;

    // Step 1: Attempt modern asynchronous clipboard write during user touch event
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(reviewText);
        copySuccess = true;
      } catch (err) {
        console.warn("Navigator clipboard write failed, attempting execCommand fallback", err);
      }
    }

    // Step 2: Legacy execCommand fallback (iOS Safari WebViews)
    if (!copySuccess) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = reviewText;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copySuccess = document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch (err) {
        console.error("execCommand fallback failed", err);
      }
    }

    // Step 3: Fire non-blocking analytics beacon
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          apiUrl("/api/analytics/track"),
          JSON.stringify({
            businessSlug,
            eventType: "COPY_AND_REDIRECT_CLICK",
            copySuccess,
            timestamp: Date.now(),
          })
        );
      }
    } catch {
      // Non-blocking telemetry
    }

    // Step 4: Handle Clipboard Permission Denied by Mobile OS
    if (!copySuccess) {
      setShowManualModal(true);
      return;
    }

    // Step 5: Haptic feedback and visual confirmation
    setIsCopied(true);
    setShowPasteGuide(true);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Step 6: Smooth 1,200ms guidance perception delay so patron sees the "Paste" instruction
    setTimeout(() => {
      window.location.href = googleReviewUrl;
    }, 1200);
  }

  function proceedDirectly() {
    window.location.href = googleReviewUrl;
  }

  return (
    <>
      {/* Helpful Pre-Click Guidance Pill */}
      <div className="mb-2 px-3 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center gap-1.5 text-xs text-indigo-900 shadow-subtle">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span className="font-medium text-center">
          Tap button below to copy &rarr; then tap <strong>&ldquo;Paste&rdquo;</strong> in Google!
        </span>
      </div>

      <button
        onClick={handleCopyAndRedirect}
        className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 ${
          isCopied
            ? "bg-emerald-600 text-white shadow-emerald-500/20"
            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
        }`}
      >
        {isCopied ? (
          <>
            <Check className="w-5 h-5 animate-in zoom-in-50 duration-150" />
            <span>✓ Copied! Opening Google Reviews...</span>
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" />
            <span>Copy Review & Open Google</span>
            <ExternalLink className="w-4 h-4 opacity-70" />
          </>
        )}
      </button>

      {/* Floating Animated "How to Paste" Confirmation Overlay */}
      {showPasteGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-modal border border-slate-200 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-subtle animate-bounce">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Review Copied to Clipboard!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Opening Google Reviews now...
              </p>
            </div>

            {/* Visual Paste Step Instruction Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-left space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  When Google opens, <strong>tap inside the empty review box</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Select <strong>&ldquo;Paste&rdquo;</strong> (or tap the keyboard paste suggestion) and hit <strong>Post</strong>!
                </span>
              </div>
            </div>

            <button
              onClick={proceedDirectly}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-98"
            >
              <span>Continue to Google Now</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Manual Copy Fallback Modal (If mobile browser blocks programmatic copy) */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-modal border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>One Quick Step</span>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your browser requested manual copy permission. Tap below to copy your draft, then proceed to Google:
            </p>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 select-all font-sans leading-relaxed">
              {reviewText}
            </div>

            <a
              href={googleReviewUrl}
              onClick={() => {
                setShowManualModal(false);
              }}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-98"
            >
              <span>Continue to Google</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
