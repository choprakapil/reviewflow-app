"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Sparkles, 
  Key, 
  Shield, 
  CheckCircle2, 
  Server, 
  Save, 
  Play, 
  Loader2, 
  AlertCircle,
  Cpu,
  Layers,
  Lock,
  Zap,
  Info
} from "lucide-react";
import { apiUrl } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TestAiResult {
  providerUsed: string;
  model: string;
  latencyMs: number;
  sampleReviewText: string;
  targetedService?: string;
}

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState("");
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [defaultLength, setDefaultLength] = useState("MEDIUM");
  const [defaultStyle, setDefaultStyle] = useState("NATURAL");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [geminiMasked, setGeminiMasked] = useState("");
  const [openRouterMasked, setOpenRouterMasked] = useState("");

  const [isTestingAi, setIsTestingAi] = useState(false);
  const [testResult, setTestResult] = useState<TestAiResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(apiUrl("/api/admin/settings"));
        const json = await res.json();
        if (json.success) {
          setGeminiMasked(json.data.geminiKeyMasked || "");
          setOpenRouterMasked(json.data.openRouterKeyMasked || "");
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(apiUrl("/api/admin/settings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiKey: geminiKey || undefined,
          openRouterKey: openRouterKey || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3500);
      }
    } catch {
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTestAi() {
    setIsTestingAi(true);
    setTestError(null);
    setTestResult(null);

    try {
      const res = await fetch(apiUrl("/api/admin/settings/test-ai"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiKey: geminiKey || undefined,
          openRouterKey: openRouterKey || undefined,
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Agency Settings & AI Configuration"
        description="Configure encrypted AI API keys, review generation defaults, and test the zero-cost failover cascade."
        badge={<Badge variant="brand">Zero-Cost Policy Enforced</Badge>}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: AI Provider Vault */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">AI Provider Vault & Credentials</CardTitle>
                <CardDescription>
                  Encrypted server-side keys for Google Gemini Free Tier and OpenRouter Free fallback
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-5">
            {/* Google Gemini Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Google Gemini API Key (Primary Provider)
                </label>
                <Badge variant="success" className="text-[10px]">
                  Free Tier: gemini-3.5-flash-lite
                </Badge>
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={geminiMasked ? `Configured (${geminiMasked})` : "Enter Gemini API key..."}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-mono placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <p className="text-[11px] text-slate-500">
                Uses Google Gemini free quota (1,500 requests/day). Never triggers paid billing.
              </p>
            </div>

            {/* OpenRouter Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  OpenRouter API Key (Secondary Provider)
                </label>
                <Badge variant="brand" className="text-[10px]">
                  Free Route: openrouter/free
                </Badge>
              </div>
              <input
                type="password"
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                placeholder={openRouterMasked ? `Configured (${openRouterMasked})` : "Enter OpenRouter API key..."}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-mono placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <p className="text-[11px] text-slate-500">
                Routes exclusively through zero-cost community models with strict rate-limit protection.
              </p>
            </div>

            {/* Policy Invariant Status Badges */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Zero-Cost Architectural Policies</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Groq Provider</span>
                  <Badge variant="danger">Permanently Disabled</Badge>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Paid Fallbacks</span>
                  <Badge variant="danger">Hard Blocked</Badge>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Final Failover</span>
                  <Badge variant="success">Deterministic (Local)</Badge>
                </div>
              </div>
            </div>

            {/* AI Test Bench Box */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-800">AI Test Bench</p>
                <p className="text-[11px] text-slate-500">
                  Execute an end-to-end inference request to benchmark latency and verify JSON schema formatting
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestAi}
                isLoading={isTestingAi}
                className="self-start sm:self-auto font-semibold"
              >
                <Play className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                <span>Run AI Test Bench</span>
              </Button>
            </div>

            {/* Test Result Display */}
            {testResult && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="brand">{testResult.providerUsed}</Badge>
                    <span className="font-mono text-slate-600 text-[11px]">{testResult.model}</span>
                  </div>
                  <span className="font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md text-xs font-bold">
                    ⚡ {testResult.latencyMs}ms latency
                  </span>
                </div>
                <p className="text-xs italic text-slate-800 bg-white p-3.5 rounded-xl border border-slate-200/80 leading-relaxed shadow-subtle">
                  &ldquo;{testResult.sampleReviewText}&rdquo;
                </p>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>Targeted Service: <strong>{testResult.targetedService || "General"}</strong></span>
                  <span>•</span>
                  <span>Structured Zod Schema Validation: <strong className="text-emerald-600">Passed</strong></span>
                </div>
              </div>
            )}

            {testError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{testError}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Generation Defaults */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">Review Generation Defaults</CardTitle>
                <CardDescription>
                  Default parameters automatically populated when onboarding new establishments
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Default Review Length
              </label>
              <select
                value={defaultLength}
                onChange={(e) => setDefaultLength(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="SHORT">Short (20-40 words, 1-2 punchy sentences)</option>
                <option value="MEDIUM">Medium (50-80 words, 3-4 balanced sentences)</option>
                <option value="LONG">Long (100-140 words, detailed customer story)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Default Writing Style
              </label>
              <select
                value={defaultStyle}
                onChange={(e) => setDefaultStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="NATURAL">Natural &amp; Conversational</option>
                <option value="PROFESSIONAL">Professional &amp; Polished</option>
                <option value="ENTHUSIASTIC">Enthusiastic &amp; High Energy</option>
                <option value="SIMPLE">Simple &amp; Direct</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Architecture & Security Ledger */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-600" />
            <span>ReviewFlow Platform v1.2 • Node.js 22 LTS • PostgreSQL 16 • Next.js 15 App Router</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <Shield className="w-4 h-4" />
            <span>Failover Order: Gemini &rarr; OpenRouter &rarr; Deterministic</span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isSaved && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuration Saved Successfully</span>
            </span>
          )}
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            className="shadow-md"
          >
            <Save className="w-4 h-4 mr-2" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
