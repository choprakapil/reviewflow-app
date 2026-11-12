import { IAIService, GenerateReviewParams, GeneratedReviewOutput } from "../ai-provider.interface";
import { PromptBuilder } from "../prompt-builder";
import { AIOutputValidator } from "../ai-output-validator";
import { ZeroCostPolicy } from "../zero-cost-policy";

export class GroqProvider implements IAIService {
  readonly providerName = "GROQ" as const;
  private readonly apiKey: string;
  private readonly modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || "";
    this.modelName = modelName || process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
  }

  getModelName(): string {
    return this.modelName;
  }

  async generateSuggestion(params: GenerateReviewParams): Promise<GeneratedReviewOutput> {
    // Strictly enforced: Groq is disabled under AI_ALLOW_GROQ=false
    ZeroCostPolicy.assertProviderAllowed("GROQ");
    if (!this.apiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const startTime = Date.now();
    const systemPrompt = PromptBuilder.buildSystemInstruction();
    const userPrompt = PromptBuilder.buildUserPrompt(params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5,000ms timeout guard

    try {
      const endpoint = "https://api.groq.com/openai/v1/chat/completions";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        const sanitized = errorText.replace(/gsk_[a-zA-Z0-9_\-]+/g, "[REDACTED_GROQ_KEY]");
        throw new Error(`Groq API error [${res.status}]: ${sanitized.slice(0, 150)}`);
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty message choices received from Groq");
      }

      // Validate output structure and policy compliance
      const validated = AIOutputValidator.parseAndValidate(content);

      return {
        reviewText: validated.reviewText,
        targetedService: validated.targetedService,
        provider: "GROQ",
        model: this.modelName,
        latencyMs: Date.now() - startTime,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
