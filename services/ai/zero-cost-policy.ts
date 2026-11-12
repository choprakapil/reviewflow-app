/**
 * Central Server-Side Zero-Cost AI Policy
 * Enforces strict ZERO-PAID-API-COST across ReviewFlow.
 */

export const ZERO_COST_POLICY = {
  AI_FREE_ONLY: true,
  AI_ALLOW_PAID_MODELS: false,
  AI_ALLOW_GROQ: false,
  AI_ALLOW_PAID_FALLBACKS: false,
  APPROVED_PROVIDERS: ["GEMINI", "OPENROUTER", "DETERMINISTIC", "OLLAMA"] as const,
  APPROVED_MODELS: {
    GEMINI: [
      "gemini-3.5-flash-lite",
      "gemini-2.5-flash-lite",
      "gemini-flash-latest",
      "gemini-flash-lite-latest",
    ],
    OPENROUTER: ["openrouter/free"],
    DETERMINISTIC: ["neutral-writing-assistant-v2"],
    OLLAMA: ["llama3.2", "llama3", "mistral", "qwen", "phi3"],
  },
} as const;

export type ApprovedProvider = (typeof ZERO_COST_POLICY.APPROVED_PROVIDERS)[number];

export class ZeroCostPolicyViolation extends Error {
  readonly code = "ZERO_COST_POLICY_VIOLATION";
  readonly status = 403;

  constructor(message: string) {
    super(`[Zero-Cost Policy Violation]: ${message}`);
    this.name = "ZeroCostPolicyViolation";
  }
}

export class ZeroCostPolicy {
  /**
   * Returns whether paid models are permitted (always false).
   */
  static allowPaidModels(): boolean {
    return ZERO_COST_POLICY.AI_ALLOW_PAID_MODELS;
  }

  /**
   * Returns whether Groq is permitted (always false).
   */
  static allowGroq(): boolean {
    return ZERO_COST_POLICY.AI_ALLOW_GROQ;
  }

  /**
   * Returns whether free-only mode is active (always true).
   */
  static isFreeOnly(): boolean {
    return ZERO_COST_POLICY.AI_FREE_ONLY;
  }

  /**
   * Evaluates if a model ID represents a paid model.
   */
  static isModelPaid(modelId: string): boolean {
    if (!modelId || typeof modelId !== "string") return true;
    const normalized = modelId.trim().toLowerCase();

    // Check OpenRouter free router & free suffix
    if (normalized === "openrouter/free" || normalized.endsWith(":free")) {
      return false;
    }

    // Check Gemini approved free models
    if (
      ZERO_COST_POLICY.APPROVED_MODELS.GEMINI.some(
        (m) => normalized === m.toLowerCase()
      )
    ) {
      return false;
    }

    // Check Deterministic template
    if (normalized === "neutral-writing-assistant-v2") {
      return false;
    }

    // Check Local Ollama models (self-hosted offline daemon, $0 API cost)
    if (
      normalized.startsWith("llama") ||
      normalized.startsWith("mistral") ||
      normalized.startsWith("qwen") ||
      normalized.startsWith("phi") ||
      normalized.startsWith("gemma")
    ) {
      return false;
    }

    // Any other model is considered paid
    return true;
  }

  /**
   * Asserts that a provider is strictly approved. Rejects Groq and any unapproved provider.
   */
  static assertProviderAllowed(provider: string): ApprovedProvider {
    if (provider === "GROQ") {
      throw new ZeroCostPolicyViolation(
        "Groq provider invocation is strictly rejected: AI_ALLOW_GROQ=false. Groq is disabled in production under the zero-paid-API-cost policy."
      );
    }

    if (
      !ZERO_COST_POLICY.APPROVED_PROVIDERS.includes(provider as ApprovedProvider)
    ) {
      throw new ZeroCostPolicyViolation(
        `Provider "${provider}" is rejected: only verified free providers (${ZERO_COST_POLICY.APPROVED_PROVIDERS.join(
          ", "
        )}) are allowed under AI_FREE_ONLY=true.`
      );
    }

    return provider as ApprovedProvider;
  }

  /**
   * Asserts that a model for a given provider is positively identified as free-tier.
   */
  static assertModelAllowed(provider: string, model: string): void {
    this.assertProviderAllowed(provider);

    if (!model || typeof model !== "string") {
      throw new ZeroCostPolicyViolation("Model ID cannot be empty.");
    }

    const normalized = model.trim().toLowerCase();

    // Known paid patterns
    const paidPatterns = [
      "gpt-4",
      "gpt-3.5-turbo",
      "claude-3",
      "claude-2",
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-2.0-pro",
      "mistral-large",
      "llama-3.1-70b-instruct",
      "llama-3.3-70b-instruct",
    ];

    for (const pattern of paidPatterns) {
      if (normalized.includes(pattern) && !normalized.endsWith(":free")) {
        throw new ZeroCostPolicyViolation(
          `Paid model "${model}" is rejected: AI_ALLOW_PAID_MODELS=false. Only zero-cost free models are permitted.`
        );
      }
    }

    if (provider === "GEMINI") {
      const allowed = ZERO_COST_POLICY.APPROVED_MODELS.GEMINI;
      if (!allowed.some((m) => normalized === m.toLowerCase())) {
        throw new ZeroCostPolicyViolation(
          `Gemini model "${model}" is rejected: must use verified free tier (${allowed.join(
            ", "
          )}).`
        );
      }
    } else if (provider === "OPENROUTER") {
      const isFree =
        normalized === "openrouter/free" || normalized.endsWith(":free");
      if (!isFree) {
        throw new ZeroCostPolicyViolation(
          `OpenRouter model "${model}" is rejected: only "openrouter/free" or verified models ending with ":free" are permitted under AI_FREE_ONLY=true.`
        );
      }
    } else if (provider === "OLLAMA") {
      // Ollama runs locally on developer/server infrastructure with $0 API cost
      return;
    }
  }

  /**
   * Asserts that fallback arrays contain only verified zero-cost models.
   */
  static assertFallbackArrayAllowed(fallbackModels: string[]): void {
    if (!Array.isArray(fallbackModels)) {
      throw new ZeroCostPolicyViolation("Fallback configuration must be an array.");
    }

    for (const model of fallbackModels) {
      if (this.isModelPaid(model)) {
        throw new ZeroCostPolicyViolation(
          `Fallback candidate "${model}" rejected: paid models are strictly forbidden in fallback arrays (AI_ALLOW_PAID_FALLBACKS=false).`
        );
      }
    }
  }
}
