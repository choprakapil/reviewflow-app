export interface CustomerExperienceAnswers {
  serviceReceived?: string;
  personalHighlight?: string;
  visitContext?: string;
}

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
  askCustomerQuestions?: boolean;
  customerAnswers?: CustomerExperienceAnswers;
}

export type AIProviderName =
  | "GEMINI"
  | "GROQ"
  | "OPENROUTER"
  | "OLLAMA"
  | "CLOUDFLARE"
  | "DETERMINISTIC";

export interface GeneratedReviewOutput {
  reviewText: string;
  targetedService?: string;
  provider: AIProviderName;
  model: string;
  latencyMs: number;
}

export interface IAIService {
  readonly providerName: AIProviderName;
  generateSuggestion(params: GenerateReviewParams): Promise<GeneratedReviewOutput>;
}

