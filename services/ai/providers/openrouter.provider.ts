import { IAIService, GenerateReviewParams, GeneratedReviewOutput } from "../ai-provider.interface";
import { PromptBuilder } from "../prompt-builder";
import { AIOutputValidator } from "../ai-output-validator";
import { logger } from "@/lib/logger";

export interface OpenRouterConfig {
  apiKey?: string;
  model?: string;
  freeOnly?: boolean;
  timeoutMs?: number;
  maxRetries?: number;
  baseUrl?: string;
}

/**
 * Validates whether an OpenRouter model ID belongs to the zero-cost free tier.
 * Allowed:
 *  - "openrouter/free" (official free-tier auto-router)
 *  - Any model ID ending with ":free" (e.g. "meta-llama/llama-3.2-3b-instruct:free", "google/gemini-2.0-flash-exp:free")
 */
export function isOpenRouterFreeModel(modelId: string): boolean {
  if (!modelId || typeof modelId !== "string") return false;
  const normalized = modelId.trim().toLowerCase();
  return normalized === "openrouter/free" || normalized.endsWith(":free");
}

export class OpenRouterProvider implements IAIService {
  readonly providerName = "OPENROUTER" as const;
  private readonly apiKey: string;
  private readonly modelName: string;
  private readonly freeOnly: boolean;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly endpoint: string;

  constructor(config?: OpenRouterConfig) {
    this.apiKey = config?.apiKey ?? (process.env.OPENROUTER_API_KEY || "");
    this.modelName = config?.model ?? (process.env.OPENROUTER_MODEL || "openrouter/free");

    // Default to true unless explicitly disabled in environment
    const envFreeOnly = process.env.OPENROUTER_FREE_ONLY;
    this.freeOnly =
      config?.freeOnly !== undefined
        ? config.freeOnly
        : envFreeOnly !== "false";

    this.timeoutMs = config?.timeoutMs ?? 25000;
    this.maxRetries = config?.maxRetries ?? 2;
    const base = config?.baseUrl || "https://openrouter.ai/api/v1";
    this.endpoint = `${base.replace(/\/$/, "")}/chat/completions`;
  }

  getModelName(): string {
    return this.modelName;
  }

  isFreeOnly(): boolean {
    return this.freeOnly;
  }

  async generateSuggestion(params: GenerateReviewParams): Promise<GeneratedReviewOutput> {
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured on the server");
    }

    // Strict Free-Only enforcement: reject all paid models upfront
    if (this.freeOnly && !isOpenRouterFreeModel(this.modelName)) {
      throw new Error(
        `Paid model ID "${this.modelName}" rejected: OPENROUTER_FREE_ONLY is active. Only free models (openrouter/free or *:free) are permitted.`
      );
    }

    const startTime = Date.now();
    const systemPrompt = PromptBuilder.buildSystemInstruction();
    const userPrompt = PromptBuilder.buildUserPrompt(params);

    const referer = process.env.NEXTAUTH_URL || "https://reviewflow.io";
    const requestBody = JSON.stringify({
      model: this.modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const res = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": referer,
            "X-Title": "ReviewFlow AI Review Assistant",
          },
          body: requestBody,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Success path
        if (res.ok) {
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content;
          if (!content) {
            throw new Error("Empty message choices received from OpenRouter API");
          }

          // Validate output structure and policy compliance (FTC 16 CFR Part 465)
          const validated = AIOutputValidator.parseAndValidate(content);

          return {
            reviewText: validated.reviewText,
            targetedService: validated.targetedService,
            provider: "OPENROUTER",
            model: this.modelName,
            latencyMs: Date.now() - startTime,
          };
        }

        // Handle rate limit (429) or transient server errors (502, 503, 504)
        const isRateLimit = res.status === 429;
        const isTransient = res.status >= 502 && res.status <= 504;
        const rawErrorText = await res.text().catch(() => "");
        const sanitizedError = rawErrorText
          .slice(0, 150)
          .replace(/sk-or-v1-[a-zA-Z0-9]+/g, "[REDACTED]");

        if ((isRateLimit || isTransient) && attempt <= this.maxRetries) {
          const retryAfterHeader = res.headers.get("retry-after");
          let delayMs = 500 * Math.pow(2, attempt - 1);
          if (retryAfterHeader) {
            const parsedSeconds = parseInt(retryAfterHeader, 10);
            if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
              delayMs = Math.min(parsedSeconds * 1000, 3000);
            }
          }
          logger.warn(
            { attempt, status: res.status, delayMs, model: this.modelName },
            "OpenRouter rate limit or transient error encountered. Backing off..."
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        // Non-retryable error (e.g. 401 unauthorized, 402 payment required, 400 bad request)
        throw new Error(`OpenRouter API error [${res.status}]: ${sanitizedError || res.statusText}`);
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const isAbort = (err as { name?: string })?.name === "AbortError";
        const message = isAbort
          ? `OpenRouter API request timed out after ${this.timeoutMs}ms`
          : err instanceof Error
          ? err.message
          : String(err);

        // Sanitize any accidentally leaked keys in error string
        const cleanMsg = message.replace(/sk-or-v1-[a-zA-Z0-9]+/g, "[REDACTED]");
        lastError = new Error(cleanMsg);

        // If timeout or abort, try retry if attempts remain
        if (isAbort && attempt <= this.maxRetries) {
          logger.warn({ attempt, timeoutMs: this.timeoutMs }, "OpenRouter timed out. Retrying...");
          continue;
        }

        // If it's a known non-retryable error, break immediately
        if (
          !isAbort &&
          !message.includes("429") &&
          !message.includes("502") &&
          !message.includes("503") &&
          !message.includes("504")
        ) {
          break;
        }
      }
    }

    throw lastError || new Error("OpenRouter request failed after retries");
  }
}
