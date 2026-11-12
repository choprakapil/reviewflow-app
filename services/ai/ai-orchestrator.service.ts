import {
  GenerateReviewParams,
  GeneratedReviewOutput,
  AIProviderName,
} from "./ai-provider.interface";
import { GeminiProvider } from "./providers/gemini.provider";
import { OpenRouterProvider } from "./providers/openrouter.provider";
import { GroqProvider } from "./providers/groq.provider";
import { OllamaProvider } from "./providers/ollama.provider";
import { DeterministicProvider } from "./providers/deterministic.provider";
import { ZeroCostPolicy } from "./zero-cost-policy";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface AIOrchestratorConfig {
  geminiKey?: string;
  geminiModel?: string;
  openRouterKey?: string;
  openRouterModel?: string;
  groqKey?: string;
  groqModel?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
}

function sanitizeErrorMessage(msg?: string): string | undefined {
  if (!msg) return undefined;
  return msg
    .replace(/sk-or-v1-[a-zA-Z0-9_\-]+/g, "[REDACTED_OPENROUTER_KEY]")
    .replace(/AQ\.[a-zA-Z0-9_\-]+/g, "[REDACTED_GEMINI_KEY]")
    .replace(/AIzaSy[a-zA-Z0-9_\-]+/g, "[REDACTED_GEMINI_KEY]")
    .replace(/gsk_[a-zA-Z0-9_\-]+/g, "[REDACTED_GROQ_KEY]")
    .replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/gi, "Bearer [REDACTED_TOKEN]")
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]")
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[REDACTED_PHONE]");
}

export class AIOrchestrator {
  private gemini: GeminiProvider;
  private openrouter: OpenRouterProvider;
  private groq: GroqProvider;
  private ollama: OllamaProvider;
  private deterministic: DeterministicProvider;
  private hasGeminiKey: boolean;
  private hasOpenRouterKey: boolean;
  private hasOllama: boolean;

  constructor(
    geminiKeyOrConfig?: string | AIOrchestratorConfig,
    groqKey?: string,
    openRouterKey?: string
  ) {
    let config: AIOrchestratorConfig = {};

    if (typeof geminiKeyOrConfig === "object" && geminiKeyOrConfig !== null) {
      config = geminiKeyOrConfig;
    } else {
      config = {
        geminiKey: geminiKeyOrConfig,
        groqKey,
        openRouterKey,
      };
    }

    const isTestEnv = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);

    const defaultGeminiKey = isTestEnv ? "" : process.env.GEMINI_API_KEY || "";
    const defaultOpenRouterKey = isTestEnv ? "" : process.env.OPENROUTER_API_KEY || "";

    const resolvedGeminiKey =
      config.geminiKey !== undefined ? config.geminiKey : defaultGeminiKey;
    const resolvedOpenRouterKey =
      config.openRouterKey !== undefined ? config.openRouterKey : defaultOpenRouterKey;

    this.hasGeminiKey = Boolean(resolvedGeminiKey);
    this.hasOpenRouterKey = Boolean(resolvedOpenRouterKey);
    this.hasOllama = Boolean(
      config.ollamaBaseUrl || (!isTestEnv && process.env.OLLAMA_BASE_URL)
    );

    this.gemini = new GeminiProvider(
      resolvedGeminiKey,
      config.geminiModel || process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"
    );

    this.openrouter = new OpenRouterProvider({
      apiKey: resolvedOpenRouterKey,
      model: config.openRouterModel || process.env.OPENROUTER_MODEL || "openrouter/free",
      freeOnly: true,
    });

    this.ollama = new OllamaProvider({
      baseUrl: config.ollamaBaseUrl || (isTestEnv ? undefined : process.env.OLLAMA_BASE_URL),
      model: config.ollamaModel || process.env.OLLAMA_MODEL || "llama3.2",
    });

    // Groq preserved as adapter only; disabled under ZeroCostPolicy
    this.groq = new GroqProvider(config.groqKey, config.groqModel);
    this.deterministic = new DeterministicProvider();
  }

  /**
   * Generates a review suggestion with strict zero-cost failover cascade:
   * 1. Primary: Google Gemini Free Tier (gemini-3.5-flash-lite)
   * 2. Secondary: OpenRouter Free Router (openrouter/free)
   * 3. Final Fallback: Deterministic Neutral Writing Assistant (Guaranteed 100% authentic, zero cost)
   *
   * Groq and all paid models/fallbacks are strictly forbidden and rejected server-side.
   */
  async generateWithFailover(
    businessId: string,
    params: GenerateReviewParams
  ): Promise<GeneratedReviewOutput> {
    // Enforce zero-cost policy on configured fallback models
    const fallbackCandidates = [
      this.gemini.getModelName(),
      this.openrouter.getModelName(),
      "neutral-writing-assistant-v2",
    ];
    if (this.hasOllama) {
      fallbackCandidates.splice(2, 0, this.ollama.getModelName());
    }
    ZeroCostPolicy.assertFallbackArrayAllowed(fallbackCandidates);

    // Stage 1 (Primary): Google Gemini Free Tier
    if (this.hasGeminiKey) {
      try {
        ZeroCostPolicy.assertProviderAllowed("GEMINI");
        ZeroCostPolicy.assertModelAllowed("GEMINI", this.gemini.getModelName());
        const result = await this.gemini.generateSuggestion(params);
        await this.logUsage(businessId, "GEMINI", result.model, result.latencyMs, true);
        return result;
      } catch (err: unknown) {
        const errorMsg = sanitizeErrorMessage(err instanceof Error ? err.message : String(err));
        logger.warn(
          { err: errorMsg, businessId, model: this.gemini.getModelName() },
          "Primary AI (Gemini free tier) failed or quota exhausted. Cascading to OpenRouter free router..."
        );
        await this.logUsage(businessId, "GEMINI", this.gemini.getModelName(), 0, false, errorMsg);
      }
    }

    // Stage 2 (Secondary): OpenRouter Free Router
    if (this.hasOpenRouterKey) {
      try {
        ZeroCostPolicy.assertProviderAllowed("OPENROUTER");
        ZeroCostPolicy.assertModelAllowed("OPENROUTER", this.openrouter.getModelName());
        const result = await this.openrouter.generateSuggestion(params);
        await this.logUsage(businessId, "OPENROUTER", result.model, result.latencyMs, true);
        return result;
      } catch (err: unknown) {
        const errorMsg = sanitizeErrorMessage(err instanceof Error ? err.message : String(err));
        logger.warn(
          { err: errorMsg, businessId, model: this.openrouter.getModelName() },
          "Secondary AI (OpenRouter free) failed or quota reached. Cascading to Deterministic fallback..."
        );
        await this.logUsage(
          businessId,
          "OPENROUTER",
          this.openrouter.getModelName(),
          0,
          false,
          errorMsg
        );
      }
    }

    // Stage 3 (Local Offline Fallback): Ollama (if configured or enabled)
    if (this.hasOllama) {
      try {
        ZeroCostPolicy.assertProviderAllowed("OLLAMA");
        ZeroCostPolicy.assertModelAllowed("OLLAMA", this.ollama.getModelName());
        const result = await this.ollama.generateSuggestion(params);
        await this.logUsage(businessId, "OLLAMA", result.model, result.latencyMs, true);
        return result;
      } catch (err: unknown) {
        const errorMsg = sanitizeErrorMessage(err instanceof Error ? err.message : String(err));
        logger.warn(
          { err: errorMsg, businessId, model: this.ollama.getModelName() },
          "Ollama local fallback failed or daemon unreachable. Cascading to Deterministic fallback..."
        );
        await this.logUsage(
          businessId,
          "OLLAMA",
          this.ollama.getModelName(),
          0,
          false,
          errorMsg
        );
      }
    }

    // Stage 4 (Final Emergency Fallback): Deterministic Neutral Writing Assistant (FTC 16 CFR Part 465)
    const fallbackResult = await this.deterministic.generateSuggestion(params);
    await this.logUsage(
      businessId,
      "DETERMINISTIC",
      fallbackResult.model,
      fallbackResult.latencyMs,
      true
    );
    return fallbackResult;
  }

  private async logUsage(
    businessId: string,
    provider: AIProviderName,
    model: string,
    latencyMs: number,
    isSuccess: boolean,
    errorMessage?: string
  ) {
    if (businessId.startsWith("test_") || businessId.startsWith("test-")) {
      logger.debug(
        { businessId, provider, model, latencyMs, isSuccess },
        "Ephemeral test bench AI usage recorded"
      );
      return;
    }

    try {
      await prisma.aIUsageLog.create({
        data: {
          businessId,
          provider,
          model,
          latencyMs,
          isSuccess,
          errorMessage: sanitizeErrorMessage(errorMessage) || null,
        },
      });
    } catch (e) {
      logger.error({ err: e, businessId }, "Failed to record persistent AIUsageLog");
    }
  }
}
