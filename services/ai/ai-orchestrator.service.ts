import {
  GenerateReviewParams,
  GeneratedReviewOutput,
  AIProviderName,
} from "./ai-provider.interface";
import { OpenRouterProvider } from "./providers/openrouter.provider";
import { OllamaProvider } from "./providers/ollama.provider";
import { GeminiProvider } from "./providers/gemini.provider";
import { GroqProvider } from "./providers/groq.provider";
import { DeterministicProvider } from "./providers/deterministic.provider";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface AIOrchestratorConfig {
  openRouterKey?: string;
  openRouterModel?: string;
  geminiKey?: string;
  groqKey?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
}

function sanitizeErrorMessage(msg?: string): string | undefined {
  if (!msg) return undefined;
  return msg
    .replace(/sk-or-v1-[a-zA-Z0-9_\-]+/g, "[REDACTED_OPENROUTER_KEY]")
    .replace(/AIzaSy[a-zA-Z0-9_\-]+/g, "[REDACTED_GEMINI_KEY]")
    .replace(/gsk_[a-zA-Z0-9_\-]+/g, "[REDACTED_GROQ_KEY]")
    .replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/gi, "Bearer [REDACTED_TOKEN]")
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]")
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[REDACTED_PHONE]");
}

export class AIOrchestrator {
  private openrouter: OpenRouterProvider;
  private ollama: OllamaProvider;
  private gemini: GeminiProvider;
  private groq: GroqProvider;
  private deterministic: DeterministicProvider;
  private hasOpenRouterKey: boolean;

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

    const resolvedOpenRouterKey =
      config.openRouterKey || process.env.OPENROUTER_API_KEY || "";
    this.hasOpenRouterKey = Boolean(resolvedOpenRouterKey);

    this.openrouter = new OpenRouterProvider({
      apiKey: resolvedOpenRouterKey,
      model: config.openRouterModel || process.env.OPENROUTER_MODEL,
    });

    this.ollama = new OllamaProvider({
      baseUrl: config.ollamaBaseUrl || process.env.OLLAMA_BASE_URL,
      model: config.ollamaModel || process.env.OLLAMA_MODEL,
    });

    this.gemini = new GeminiProvider(config.geminiKey);
    this.groq = new GroqProvider(config.groqKey);
    this.deterministic = new DeterministicProvider();
  }

  /**
   * Generates a review suggestion with automatic failover cascade:
   * When OpenRouter is configured:
   *   1. OpenRouter (Free Router: openrouter/free)
   *   2. Ollama Local Daemon (if available)
   *   3. Gemini / Groq (if configured)
   *   4. Deterministic Local Template (Guaranteed Emergency Fallback)
   * When OpenRouter is not configured:
   *   1. Gemini Flash
   *   2. Groq Llama 3.1
   *   3. Ollama Local Daemon
   *   4. Deterministic Local Template
   */
  async generateWithFailover(
    businessId: string,
    params: GenerateReviewParams
  ): Promise<GeneratedReviewOutput> {
    // Branch A: OpenRouter configured as primary free router
    if (this.hasOpenRouterKey) {
      try {
        const result = await this.openrouter.generateSuggestion(params);
        await this.logUsage(businessId, "OPENROUTER", result.model, result.latencyMs, true);
        return result;
      } catch (err: unknown) {
        const errorMsg = sanitizeErrorMessage(err instanceof Error ? err.message : String(err));
        logger.warn(
          { err: errorMsg, businessId, model: this.openrouter.getModelName() },
          "Primary AI (OpenRouter free) failed or quota reached. Cascading to Ollama..."
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

      // Fallback 1 for OpenRouter: Ollama local daemon
      try {
        const result = await this.ollama.generateSuggestion(params);
        await this.logUsage(businessId, "OLLAMA", result.model, result.latencyMs, true);
        return result;
      } catch (err: unknown) {
        const errorMsg = sanitizeErrorMessage(err instanceof Error ? err.message : String(err));
        logger.warn(
          { err: errorMsg, businessId },
          "Secondary AI (Ollama) unavailable. Cascading to secondary cloud / deterministic..."
        );
        await this.logUsage(businessId, "OLLAMA", this.ollama.getModelName(), 0, false, errorMsg);
      }
    }

    // Branch B / Fallback: Google Gemini
    try {
      const result = await this.gemini.generateSuggestion(params);
      await this.logUsage(businessId, "GEMINI", result.model, result.latencyMs, true);
      return result;
    } catch (err: unknown) {
      const errorMsg = sanitizeErrorMessage(err instanceof Error ? err.message : String(err));
      logger.warn({ err: errorMsg, businessId }, "Gemini AI failed. Cascading to Groq...");
      await this.logUsage(businessId, "GEMINI", "gemini-1.5-flash", 0, false, errorMsg);
    }

    // Branch C / Fallback: Groq Cloud
    try {
      const result = await this.groq.generateSuggestion(params);
      await this.logUsage(businessId, "GROQ", result.model, result.latencyMs, true);
      return result;
    } catch (err: unknown) {
      const errorMsg = sanitizeErrorMessage(err instanceof Error ? err.message : String(err));
      logger.warn({ err: errorMsg, businessId }, "Groq AI failed. Cascading to Ollama/Deterministic...");
      await this.logUsage(businessId, "GROQ", this.groq.getModelName(), 0, false, errorMsg);
    }

    // Branch D: Ollama (if not already attempted in Branch A)
    if (!this.hasOpenRouterKey) {
      try {
        const result = await this.ollama.generateSuggestion(params);
        await this.logUsage(businessId, "OLLAMA", result.model, result.latencyMs, true);
        return result;
      } catch (err: unknown) {
        const errorMsg = sanitizeErrorMessage(err instanceof Error ? err.message : String(err));
        logger.warn({ err: errorMsg, businessId }, "Ollama unavailable. Cascading to Deterministic...");
        await this.logUsage(businessId, "OLLAMA", this.ollama.getModelName(), 0, false, errorMsg);
      }
    }

    // Guaranteed Emergency Fallback: Deterministic Neutral Writing Assistant (FTC 16 CFR Part 465)
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
    // Skip persistent database write if businessId is an ephemeral test harness identifier
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
      // Non-blocking log failure
      logger.error({ err: e, businessId }, "Failed to record persistent AIUsageLog");
    }
  }
}
