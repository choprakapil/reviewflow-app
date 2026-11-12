export interface GenerateReviewParams {
  businessName: string;
  category: string;
  services: string[];
  keywords: string[];
  factualHighlights?: string[];
  reviewLength: "SHORT" | "MEDIUM" | "LONG";
  writingStyle: "NATURAL" | "PROFESSIONAL" | "ENTHUSIASTIC" | "SIMPLE";
  language: string;
  customInstructions?: string;
}

export interface GeneratedReviewOutput {
  reviewText: string;
  targetedService?: string;
  provider: "GEMINI" | "GROQ" | "CLOUDFLARE" | "DETERMINISTIC";
  model: string;
  latencyMs: number;
}

export interface IAIService {
  readonly providerName: "GEMINI" | "GROQ" | "CLOUDFLARE" | "DETERMINISTIC";
  generateSuggestion(params: GenerateReviewParams): Promise<GeneratedReviewOutput>;
}

