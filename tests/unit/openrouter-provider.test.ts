import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  OpenRouterProvider,
  isOpenRouterFreeModel,
} from "@/services/ai/providers/openrouter.provider";
import { OllamaProvider } from "@/services/ai/providers/ollama.provider";
import { AIOrchestrator } from "@/services/ai/ai-orchestrator.service";
import { GenerateReviewParams } from "@/services/ai/ai-provider.interface";

const mockParams: GenerateReviewParams = {
  businessName: "Summit Mountain Gear",
  category: "Outdoor Retail",
  services: ["Boot Fitting", "Ski Tuning"],
  keywords: ["knowledgeable", "expert"],
  reviewLength: "MEDIUM",
  writingStyle: "NATURAL",
  language: "en",
};

describe("OpenRouter Provider & Safety Verification Suite", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("Free Model Validation (Zero-Cost Enforcement)", () => {
    it("correctly identifies valid zero-cost free models", () => {
      expect(isOpenRouterFreeModel("openrouter/free")).toBe(true);
      expect(isOpenRouterFreeModel("openrouter/auto:free")).toBe(true);
      expect(isOpenRouterFreeModel("meta-llama/llama-3.2-3b-instruct:free")).toBe(true);
      expect(isOpenRouterFreeModel("google/gemini-2.0-flash-exp:free")).toBe(true);
      expect(isOpenRouterFreeModel("deepseek/deepseek-r1:free")).toBe(true);
      expect(isOpenRouterFreeModel("qwen/qwen-2.5-72b-instruct:free")).toBe(true);
      expect(isOpenRouterFreeModel("mistralai/mistral-7b-instruct:free")).toBe(true);
    });

    it("strictly rejects paid model IDs", () => {
      expect(isOpenRouterFreeModel("openai/gpt-4o")).toBe(false);
      expect(isOpenRouterFreeModel("openai/gpt-4o-mini")).toBe(false);
      expect(isOpenRouterFreeModel("anthropic/claude-3.5-sonnet")).toBe(false);
      expect(isOpenRouterFreeModel("anthropic/claude-3-opus")).toBe(false);
      expect(isOpenRouterFreeModel("meta-llama/llama-3.1-70b-instruct")).toBe(false);
      expect(isOpenRouterFreeModel("google/gemini-pro")).toBe(false);
      expect(isOpenRouterFreeModel("")).toBe(false);
    });

    it("throws immediately before network call if paid model ID is attempted with freeOnly=true", async () => {
      const fetchMock = vi.fn();
      global.fetch = fetchMock;

      const provider = new OpenRouterProvider({
        apiKey: "sk-or-v1-mock-test-key",
        model: "openai/gpt-4o",
        freeOnly: true,
      });

      await expect(provider.generateSuggestion(mockParams)).rejects.toThrow(
        /Paid model.*"openai\/gpt-4o".*rejected/
      );

      // Verify zero network calls were dispatched
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("API Credential & Parameter Guards", () => {
    it("rejects execution when OPENROUTER_API_KEY is missing", async () => {
      const provider = new OpenRouterProvider({
        apiKey: "",
        model: "openrouter/free",
      });

      await expect(provider.generateSuggestion(mockParams)).rejects.toThrow(
        "OPENROUTER_API_KEY is not configured on the server"
      );
    });

    it("never leaks API credentials in sanitized error messages", async () => {
      const secretKey = "sk-or-v1-super-secret-production-key-998877";
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => `Invalid token: ${secretKey}`,
        headers: new Headers(),
      });

      const provider = new OpenRouterProvider({
        apiKey: secretKey,
        model: "openrouter/free",
        maxRetries: 0,
      });

      try {
        await provider.generateSuggestion(mockParams);
        expect.unreachable("Should have thrown 401 error");
      } catch (err: unknown) {
        const msg = (err as Error).message;
        expect(msg).not.toContain(secretKey);
        expect(msg).toContain("[REDACTED]");
      }
    });
  });

  describe("Successful Generation & Format Compliance", () => {
    it("successfully generates compliant review using openrouter/free", async () => {
      const mockReviewText =
        "Summit Mountain Gear provided outstanding [describe your boot fitting]. The staff was attentive and [add your thoughts on the gear recommendations].";

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          id: "gen-12345",
          model: "openrouter/free",
          choices: [
            {
              message: {
                content: JSON.stringify({
                  reviewText: mockReviewText,
                  targetedService: "Boot Fitting",
                }),
              },
            },
          ],
        }),
      });

      const provider = new OpenRouterProvider({
        apiKey: "sk-or-v1-mock-valid-key",
        model: "openrouter/free",
      });

      const output = await provider.generateSuggestion(mockParams);

      expect(output.provider).toBe("OPENROUTER");
      expect(output.model).toBe("openrouter/free");
      expect(output.reviewText).toBe(mockReviewText);
      expect(output.targetedService).toBe("Boot Fitting");
      expect(output.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Rate-Limit (429) & Retry Handling", () => {
    it("retries on 429 rate limit and succeeds on subsequent attempt", async () => {
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return {
            ok: false,
            status: 429,
            statusText: "Too Many Requests",
            headers: new Headers({ "retry-after": "0" }),
            text: async () => "Rate limit exceeded, free credits queued",
          };
        }
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    reviewText:
                      "Summit Mountain Gear was great for [Boot Fitting]. [Add your personal impressions here].",
                    targetedService: "Boot Fitting",
                  }),
                },
              },
            ],
          }),
        };
      });

      const provider = new OpenRouterProvider({
        apiKey: "sk-or-v1-mock-retry-key",
        model: "openrouter/free",
        maxRetries: 2,
      });

      const result = await provider.generateSuggestion(mockParams);
      expect(result.provider).toBe("OPENROUTER");
      expect(callCount).toBe(2);
    });
  });

  describe("Ollama Provider & Local Offline Fallback", () => {
    it("Ollama generates structured suggestion when service is available", async () => {
      const mockReviewText =
        "Summit Mountain Gear has high-quality outdoor gear. [Describe your Ski Tuning experience].";

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          model: "llama3.2",
          message: {
            content: JSON.stringify({
              reviewText: mockReviewText,
              targetedService: "Ski Tuning",
            }),
          },
        }),
      });

      const ollama = new OllamaProvider({
        baseUrl: "http://localhost:11434",
        model: "llama3.2",
      });

      const output = await ollama.generateSuggestion(mockParams);
      expect(output.provider).toBe("OLLAMA");
      expect(output.model).toBe("llama3.2");
      expect(output.reviewText).toBe(mockReviewText);
    });
  });

  describe("Orchestrator Cascade: OpenRouter -> Ollama -> Deterministic", () => {
    it("cascades from failing OpenRouter to Ollama when Ollama succeeds", async () => {
      // Mock fetch: fails for OpenRouter (429 or quota), succeeds for Ollama
      global.fetch = vi.fn().mockImplementation(async (url: string | URL | Request) => {
        const urlStr = url.toString();
        if (urlStr.includes("openrouter.ai")) {
          return {
            ok: false,
            status: 429,
            statusText: "Rate Limited / Out of Free Credits",
            headers: new Headers(),
            text: async () => "Free model quota reached",
          };
        }
        if (urlStr.includes("11434")) {
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => ({
              model: "llama3.2",
              message: {
                content: JSON.stringify({
                  reviewText:
                    "Summit Mountain Gear - [Describe your experience with Ski Tuning]. [Add personal notes].",
                  targetedService: "Ski Tuning",
                }),
              },
            }),
          };
        }
        throw new Error("Unexpected URL called: " + urlStr);
      });

      const orchestrator = new AIOrchestrator({
        openRouterKey: "sk-or-v1-mock-test-key",
        openRouterModel: "openrouter/free",
        ollamaBaseUrl: "http://localhost:11434",
      });

      const result = await orchestrator.generateWithFailover("test_failover_unit", mockParams);
      expect(result.provider).toBe("OLLAMA");
    });

    it("cascades to deterministic template when OpenRouter and Ollama both fail", async () => {
      // Both fail
      global.fetch = vi.fn().mockImplementation(async () => {
        throw new Error("Network unreachable");
      });

      const orchestrator = new AIOrchestrator({
        openRouterKey: "sk-or-v1-mock-test-key",
        openRouterModel: "openrouter/free",
        ollamaBaseUrl: "http://localhost:11434",
      });

      const result = await orchestrator.generateWithFailover("test_failover_unit", mockParams);
      expect(result.provider).toBe("DETERMINISTIC");
      expect(result.reviewText).toContain("Summit Mountain Gear");
    });
  });
});
