import { IAIService, GenerateReviewParams, GeneratedReviewOutput } from "../ai-provider.interface";

export class DeterministicProvider implements IAIService {
  readonly providerName = "DETERMINISTIC" as const;

  async generateSuggestion(params: GenerateReviewParams): Promise<GeneratedReviewOutput> {
    const startTime = Date.now();
    const service =
      params.services.length > 0
        ? params.services[Math.floor(Math.random() * params.services.length)]
        : "their services";

    const fact =
      params.factualHighlights && params.factualHighlights.length > 0
        ? ` ${params.factualHighlights[0]}.`
        : "";

    // Deterministic rule-based template library
    const templates = [
      `I had a wonderful experience with ${params.businessName} recently for ${service}. The entire team was professional, attentive, and made the whole process completely stress-free.${fact} Highly recommended!`,
      `Outstanding visit to ${params.businessName}! From arrival to finish, their customer care was top-notch. Very satisfied with ${service} and will definitely be coming back.`,
      `Great service and friendly atmosphere at ${params.businessName}. They took the time to explain everything clearly regarding ${service}.${fact} A fantastic local business.`,
      `I rarely write reviews, but ${params.businessName} truly earned this one. Quick, reliable, and thorough care for ${service}. Five stars all the way!`,
    ];

    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

    return {
      reviewText: selectedTemplate,
      targetedService: service,
      provider: "DETERMINISTIC",
      model: "local-rule-engine-v1",
      latencyMs: Date.now() - startTime,
    };
  }
}

