import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ZeroCostPolicy,
  ZeroCostPolicyViolation,
  ZERO_COST_POLICY,
} from "@/services/ai/zero-cost-policy";
import { GeminiProvider } from "@/services/ai/providers/gemini.provider";
import { OpenRouterProvider } from "@/services/ai/providers/openrouter.provider";
import { GroqProvider } from "@/services/ai/providers/groq.provider";
import { DeterministicProvider } from "@/services/ai/providers/deterministic.provider";
import { AIOrchestrator } from "@/services/ai/ai-orchestrator.service";
import { GenerateReviewParams } from "@/services/ai/ai-provider.interface";
import { AIOutputValidator } from "@/services/ai/ai-output-validator";

const baseParams: GenerateReviewParams = {
  businessName: "Beacon Dental Studio",
  category: "Dentistry",
  services: ["Invisalign Clear Aligners", "Teeth Whitening"],
  keywords: ["Gentle Care", "Modern Facility"],
  reviewLength: "MEDIUM",
  writingStyle: "NATURAL",
  language: "en",
};

describe("Zero-Cost AI Architecture & Policy Governance Suite", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // Test 1: Gemini uses only approved models
  it("Test 1: Gemini allows approved free model and rejects unapproved models", async () => {
    expect(() =>
      ZeroCostPolicy.assertModelAllowed("GEMINI", "gemini-3.5-flash-lite")
    ).not.toThrow();

    expect(() =>
      ZeroCostPolicy.assertModelAllowed("GEMINI", "gemini-1.5-pro")
    ).toThrow(ZeroCostPolicyViolation);

    const provider = new GeminiProvider("mock_key", "gemini-1.5-pro");
    await expect(provider.generateSuggestion(baseParams)).rejects.toThrow(
      /Paid model "gemini-1.5-pro" is rejected|is not on the approved free-tier list/
    );
  });

  // Test 2: OpenRouter uses openrouter/free
  it("Test 2: OpenRouter accepts openrouter/free and free-suffixed models", async () => {
    expect(() =>
      ZeroCostPolicy.assertModelAllowed("OPENROUTER", "openrouter/free")
    ).not.toThrow();

    expect(() =>
      ZeroCostPolicy.assertModelAllowed("OPENROUTER", "meta-llama/llama-3.2-3b-instruct:free")
    ).not.toThrow();
  });

  // Test 3: Paid model IDs are rejected
  it("Test 3: Paid model IDs are strictly rejected across all providers", () => {
    const paidModels = [
      "openai/gpt-4o",
      "openai/gpt-4o-mini",
      "anthropic/claude-3.5-sonnet",
      "anthropic/claude-3-opus",
      "meta-llama/llama-3.1-70b-instruct",
      "google/gemini-pro",
    ];

    for (const model of paidModels) {
      expect(ZeroCostPolicy.isModelPaid(model)).toBe(true);
      expect(() =>
        ZeroCostPolicy.assertModelAllowed("OPENROUTER", model)
      ).toThrow(ZeroCostPolicyViolation);
    }
  });

  // Test 4: Paid fallback arrays are rejected
  it("Test 4: Fallback arrays containing paid models are strictly rejected", () => {
    const invalidArray = ["gemini-3.5-flash-lite", "openai/gpt-4o", "neutral-writing-assistant-v2"];
    expect(() =>
      ZeroCostPolicy.assertFallbackArrayAllowed(invalidArray)
    ).toThrow(/Fallback candidate "openai\/gpt-4o" rejected: paid models are strictly forbidden/);

    const validArray = ["gemini-3.5-flash-lite", "openrouter/free", "neutral-writing-assistant-v2"];
    expect(() => ZeroCostPolicy.assertFallbackArrayAllowed(validArray)).not.toThrow();
  });

  // Test 5: Groq cannot be called
  it("Test 5: Groq provider invocation is strictly rejected server-side", async () => {
    expect(() => ZeroCostPolicy.assertProviderAllowed("GROQ")).toThrow(
      /Groq provider invocation is strictly rejected: AI_ALLOW_GROQ=false/
    );

    const groq = new GroqProvider("mock_key");
    await expect(groq.generateSuggestion(baseParams)).rejects.toThrow(
      ZeroCostPolicyViolation
    );
  });

  // Test 6: No provider call occurs when AI is disabled
  it("Test 6: When AI providers are unconfigured, orchestrator cascades safely to Deterministic with zero external network requests", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    const orchestrator = new AIOrchestrator("", "");
    const result = await orchestrator.generateWithFailover("test_no_keys", baseParams);

    expect(result.provider).toBe("DETERMINISTIC");
    expect(result.reviewText).toContain("Beacon Dental Studio");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // Test 7: Quota exhaustion invokes the next approved free provider
  it("Test 7: Gemini quota exhaustion (429) automatically cascades to OpenRouter free router", async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes("generativelanguage.googleapis.com")) {
        // Mock Gemini 429 (Resource Exhausted / Quota Limit)
        return {
          ok: false,
          status: 429,
          statusText: "RESOURCE_EXHAUSTED",
          text: async () => JSON.stringify({ error: { message: "Quota exceeded for quota metric 'Generate Content API'" } }),
        };
      }
      if (urlStr.includes("openrouter.ai")) {
        // OpenRouter free router succeeds
        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    reviewText: "Beacon Dental Studio — [Describe your visit]. [Add what stood out].",
                    targetedService: "Invisalign Clear Aligners",
                  }),
                },
              },
            ],
          }),
        };
      }
      throw new Error("Unexpected request: " + urlStr);
    });

    const orchestrator = new AIOrchestrator({
      geminiKey: "mock_gemini_key",
      geminiModel: "gemini-3.5-flash-lite",
      openRouterKey: "mock_openrouter_key",
      openRouterModel: "openrouter/free",
    });

    const result = await orchestrator.generateWithFailover("test_failover_quota", baseParams);
    expect(result.provider).toBe("OPENROUTER");
    expect(result.targetedService).toBe("Invisalign Clear Aligners");
  });

  // Test 8: Both provider failures invoke deterministic fallback
  it("Test 8: Failure of both Gemini and OpenRouter cascades cleanly to Deterministic neutral templates", async () => {
    global.fetch = vi.fn().mockImplementation(async () => {
      return {
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        text: async () => "Upstream outage",
      };
    });

    const orchestrator = new AIOrchestrator({
      geminiKey: "mock_gemini_key",
      geminiModel: "gemini-3.5-flash-lite",
      openRouterKey: "mock_openrouter_key",
      openRouterModel: "openrouter/free",
    });

    const result = await orchestrator.generateWithFailover("test_both_fail", baseParams);
    expect(result.provider).toBe("DETERMINISTIC");
    expect(result.reviewText).toContain("Beacon Dental Studio");
    expect(result.reviewText).toMatch(/\[.*\]/);
  });

  // Test 9: No API key appears in client bundles or logs
  it("Test 9: Error messages redact API key patterns and prevent secret leakage in logs", async () => {
    const sensitiveGeminiKey = "AQ.SecretGeminiToken998877";
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => `API request failed with key ${sensitiveGeminiKey}`,
    });

    const provider = new GeminiProvider(sensitiveGeminiKey, "gemini-3.5-flash-lite");
    try {
      await provider.generateSuggestion(baseParams);
      expect.unreachable("Should have thrown error");
    } catch (err: unknown) {
      const msg = (err as Error).message;
      expect(msg).not.toContain(sensitiveGeminiKey);
      expect(msg).toContain("[REDACTED_GEMINI_KEY]");
    }
  });

  // Test 10: Customer experience questions OFF generates neutral placeholders
  it("Test 10: When customer questions are OFF, output retains neutral bracketed placeholders without fabricated facts", async () => {
    const provider = new DeterministicProvider();
    const result = await provider.generateSuggestion({
      ...baseParams,
      askCustomerQuestions: false,
    });

    expect(result.reviewText).toMatch(/\[.*\]/);
    expect(result.reviewText).toContain("Beacon Dental Studio");
    expect(result.reviewText).not.toContain("I was extremely satisfied");
    expect(result.reviewText).not.toContain("5-star guarantee");
  });

  // Test 11: Customer experience questions ON uses only customer-provided information
  it("Test 11: When customer questions are ON, output uses strictly customer-provided details", async () => {
    const provider = new DeterministicProvider();
    const result = await provider.generateSuggestion({
      ...baseParams,
      askCustomerQuestions: true,
      customerAnswers: {
        serviceReceived: "Routine Teeth Cleaning",
        personalHighlight: "Attentive hygienist and gentle care",
        visitContext: "Would visit again",
      },
    });

    expect(result.reviewText).toContain("I visited for Routine Teeth Cleaning.");
    expect(result.reviewText).toContain("Attentive hygienist and gentle care.");
    expect(result.reviewText).toContain("Would visit again.");
    // Does NOT fabricate unmentioned staff or 5-star guarantees
    expect(result.reviewText).not.toContain("Dr. Smith");
    expect(result.reviewText).not.toContain("5-star guarantee");
  });

  // Test 12: Provider output is validated before display
  it("Test 12: Output validator enforces valid JSON schema and strips non-compliant claims", () => {
    const validJson = JSON.stringify({
      reviewText: "Beacon Dental Studio — [Describe the service]. [Add your impressions].",
      targetedService: "Teeth Whitening",
    });

    const validated = AIOutputValidator.parseAndValidate(validJson);
    expect(validated.reviewText).toBeDefined();
    expect(validated.targetedService).toBe("Teeth Whitening");

    const invalidJson = "Not a JSON payload";
    expect(() => AIOutputValidator.parseAndValidate(invalidJson)).toThrow();
  });
});
