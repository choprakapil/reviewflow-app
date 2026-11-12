"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, AlertCircle, X } from "lucide-react";

interface ActionButtonProps {
  reviewText: string;
  googleReviewUrl: string;
  businessSlug: string;
}

export function ActionButton({ reviewText, googleReviewUrl, businessSlug }: ActionButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

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
          "/api/analytics/track",
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
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Step 6: Direct navigation after 350ms tactile perception delay
    setTimeout(() => {
      window.location.href = googleReviewUrl;
    }, 350);
  }

  return (
    <>
      <button
        onClick={handleCopyAndRedirect}
        className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 ${
          isCopied
            ? "bg-emerald-600 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {isCopied ? (
          <>
            <Check className="w-5 h-5 animate-in zoom-in-50 duration-150" />
            <span>✓ Copied! Opening Google...</span>
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" />
            <span>Copy Review & Open Google</span>
            <ExternalLink className="w-4 h-4 opacity-70" />
          </>
        )}
      </button>

      {/* Manual Copy Fallback Modal (If mobile browser blocks programmatic copy) */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>One Quick Step</span>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Your browser requested manual copy permission. Tap below to copy your draft, then proceed to Google:
            </p>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 select-all font-sans">
              {reviewText}
            </div>

            <a
              href={googleReviewUrl}
              onClick={() => {
                setShowManualModal(false);
              }}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md"
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

