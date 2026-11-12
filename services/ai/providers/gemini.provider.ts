import { IAIService, GenerateReviewParams, GeneratedReviewOutput } from "../ai-provider.interface";
import { PromptBuilder } from "../prompt-builder";

export class GeminiProvider implements IAIService {
  readonly providerName = "GEMINI" as const;
  private readonly apiKey: string;
  private readonly modelName: string;

  constructor(apiKey?: string, modelName = "gemini-1.5-flash") {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    this.modelName = modelName;
  }

  async generateSuggestion(params: GenerateReviewParams): Promise<GeneratedReviewOutput> {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const startTime = Date.now();
    const systemPrompt = PromptBuilder.buildSystemInstruction();
    const userPrompt = PromptBuilder.buildUserPrompt(params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2,500ms timeout guard

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API error [${res.status}]: ${errorText}`);
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("Empty candidate payload received from Gemini");
      }

      const parsed = JSON.parse(rawText);
      return {
        reviewText: parsed.reviewText || rawText,
        targetedService: parsed.targetedService,
        provider: "GEMINI",
        model: this.modelName,
        latencyMs: Date.now() - startTime,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

