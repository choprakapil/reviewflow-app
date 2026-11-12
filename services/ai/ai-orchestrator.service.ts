import { IAIService, GenerateReviewParams, GeneratedReviewOutput } from "./ai-provider.interface";
import { GeminiProvider } from "./providers/gemini.provider";
import { GroqProvider } from "./providers/groq.provider";
import { DeterministicProvider } from "./providers/deterministic.provider";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export class AIOrchestrator {
  private gemini: GeminiProvider;
  private groq: GroqProvider;
  private deterministic: DeterministicProvider;

  constructor(geminiKey?: string, groqKey?: string) {
    this.gemini = new GeminiProvider(geminiKey);
    this.groq = new GroqProvider(groqKey);
    this.deterministic = new DeterministicProvider();
  }

  /**
   * Generates a review suggestion with automatic failover cascade:
   * 1. Gemini Flash (Primary)
   * 2. Groq Llama 3.1 70B (Secondary)
   * 3. Deterministic Local Template (Guaranteed Emergency Fallback)
   */
  async generateWithFailover(
    businessId: string,
    params: GenerateReviewParams
  ): Promise<GeneratedReviewOutput> {
    // Stage 1: Try Primary Provider (Google Gemini)
    try {
      const result = await this.gemini.generateSuggestion(params);
      await this.logUsage(businessId, "GEMINI", result.model, result.latencyMs, true);
      return result;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.warn({ err: errorMsg, businessId }, "Primary AI (Gemini) failed. Cascading to Groq...");
      await this.logUsage(businessId, "GEMINI", "gemini-1.5-flash", 0, false, errorMsg);
    }

    // Stage 2: Try Hot Secondary Provider (Groq Cloud)
    try {
      const result = await this.groq.generateSuggestion(params);
      await this.logUsage(businessId, "GROQ", result.model, result.latencyMs, true);
      return result;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.warn({ err: errorMsg, businessId }, "Secondary AI (Groq) failed. Cascading to Deterministic...");
      await this.logUsage(businessId, "GROQ", "llama-3.1-70b-versatile", 0, false, errorMsg);
    }

    // Stage 3: Instant Deterministic Fallback (Guarantees zero downtime)
    const fallbackResult = await this.deterministic.generateSuggestion(params);
    await this.logUsage(businessId, "DETERMINISTIC", fallbackResult.model, fallbackResult.latencyMs, true);
    return fallbackResult;
  }

  private async logUsage(
    businessId: string,
    provider: string,
    model: string,
    latencyMs: number,
    isSuccess: boolean,
    errorMessage?: string
  ) {
    try {
      await prisma.aIUsageLog.create({
        data: {
          businessId,
          provider,
          model,
          latencyMs,
          isSuccess,
          errorMessage: errorMessage || null,
        },
      });
    } catch (e) {
      // Non-blocking log failure
      console.error("[AIUsageLog Error]:", e);
    }
  }
}

