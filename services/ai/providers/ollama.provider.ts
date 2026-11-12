import { IAIService, GenerateReviewParams, GeneratedReviewOutput } from "../ai-provider.interface";
import { PromptBuilder } from "../prompt-builder";
import { AIOutputValidator } from "../ai-output-validator";

export interface OllamaConfig {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

export class OllamaProvider implements IAIService {
  readonly providerName = "OLLAMA" as const;
  private readonly baseUrl: string;
  private readonly modelName: string;
  private readonly timeoutMs: number;

  constructor(config?: OllamaConfig) {
    this.baseUrl = (config?.baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, "");
    this.modelName = config?.model || process.env.OLLAMA_MODEL || "llama3.2";
    this.timeoutMs = config?.timeoutMs ?? 2500; // 2.5s fast timeout to prevent blocking on inactive local daemon
  }

  getModelName(): string {
    return this.modelName;
  }

  async generateSuggestion(params: GenerateReviewParams): Promise<GeneratedReviewOutput> {
    const startTime = Date.now();
    const systemPrompt = PromptBuilder.buildSystemInstruction();
    const userPrompt = PromptBuilder.buildUserPrompt(params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const endpoint = `${this.baseUrl}/api/chat`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          format: "json",
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 300,
          },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(`Ollama API error [${res.status}]: ${errorText.slice(0, 150)}`);
      }

      const data = await res.json();
      const content = data?.message?.content;
      if (!content) {
        throw new Error("Empty message content received from Ollama");
      }

      // Validate output structure and policy compliance
      const validated = AIOutputValidator.parseAndValidate(content);

      return {
        reviewText: validated.reviewText,
        targetedService: validated.targetedService,
        provider: "OLLAMA",
        model: this.modelName,
        latencyMs: Date.now() - startTime,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
