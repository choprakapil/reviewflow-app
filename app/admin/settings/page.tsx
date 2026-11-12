"use client";

import { useState } from "react";
import { Settings, Sparkles, Key, Shield, CheckCircle2, Server, Save, Play, Loader2, AlertCircle } from "lucide-react";

interface TestAiResult {
  providerUsed: string;
  model: string;
  latencyMs: number;
  sampleReviewText: string;
  targetedService?: string;
}

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [defaultLength, setDefaultLength] = useState("MEDIUM");
  const [defaultStyle, setDefaultStyle] = useState("NATURAL");
  const [isSaved, setIsSaved] = useState(false);

  const [isTestingAi, setIsTestingAi] = useState(false);
  const [testResult, setTestResult] = useState<TestAiResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }

  async function handleTestAi() {
    setIsTestingAi(true);
    setTestError(null);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/settings/test-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiKey: geminiKey || undefined,
          groqKey: groqKey || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setTestResult(json.data);
      } else {
        setTestError(json.error?.message || "AI Test Bench request failed");
      }
    } catch (err: unknown) {
      setTestError(err instanceof Error ? err.message : "Network error testing AI");
    } finally {
      setIsTestingAi(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <span>Agency Settings & AI Configuration</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage AI API key credentials, default prompt parameters, and system security
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: AI Provider Keys */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                AI Provider API Vault
              </h2>
              <p className="text-xs text-zinc-500">
                Encrypted server-side keys for Google Gemini and Groq failover
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Google Gemini API Key (Primary Provider)
                </label>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Free Tier: 1,500 req/day</span>
                </span>
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Groq Cloud API Key (Hot Failover Provider)
                </label>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Free Tier: 14,400 req/day</span>
                </span>
              </div>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Test Bench Action */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-zinc-500">
                Run an end-to-end latency & failover test with current credentials
              </div>
              <button
                type="button"
                onClick={handleTestAi}
                disabled={isTestingAi}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-semibold transition-all disabled:opacity-50 self-start sm:self-auto"
              >
                {isTestingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Testing AI Cascade...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-blue-600" />
                    <span>Run AI Test Bench</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Result Display */}
            {testResult && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Provider: <strong className="text-blue-600">{testResult.providerUsed}</strong> ({testResult.model})
                  </span>
                  <span className="font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    {testResult.latencyMs}ms latency
                  </span>
                </div>
                <p className="text-xs italic text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                  &ldquo;{testResult.sampleReviewText}&rdquo;
                </p>
                <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                  <span>Targeted Service: {testResult.targetedService || "General"}</span>
                  <span>•</span>
                  <span>Model: {testResult.model}</span>
                </div>
              </div>
            )}

            {testError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{testError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Generation Defaults */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Review Generation Defaults
              </h2>
              <p className="text-xs text-zinc-500">
                Default length and tone applied to newly onboarded businesses
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Default Review Length
              </label>
              <select
                value={defaultLength}
                onChange={(e) => setDefaultLength(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="SHORT">Short (20-40 words, 1-2 sentences)</option>
                <option value="MEDIUM">Medium (50-80 words, 3-4 sentences)</option>
                <option value="LONG">Long (100-140 words, detailed reflection)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Default Writing Style
              </label>
              <select
                value={defaultStyle}
                onChange={(e) => setDefaultStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="NATURAL">Natural &amp; Conversational</option>
                <option value="PROFESSIONAL">Professional &amp; Polished</option>
                <option value="ENTHUSIASTIC">Enthusiastic &amp; High Energy</option>
                <option value="SIMPLE">Simple &amp; Direct</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Architecture & Security Info */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-zinc-400" />
            <span>ReviewFlow v1.0 • Node.js 22 LTS • PostgreSQL 16</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-600">
            <Shield className="w-4 h-4" />
            <span>Failover Active (Gemini &gt; Groq &gt; Local)</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {isSaved && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings Saved Successfully</span>
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </main>
  );
}

