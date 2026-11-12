import { IAIService, GenerateReviewParams, GeneratedReviewOutput } from "../ai-provider.interface";

export class DeterministicProvider implements IAIService {
  readonly providerName = "DETERMINISTIC" as const;

  async generateSuggestion(params: GenerateReviewParams): Promise<GeneratedReviewOutput> {
    const startTime = Date.now();
    const service =
      params.services.length > 0
        ? params.services[Math.floor(Math.random() * params.services.length)]
        : "services";

    const fact =
      params.factualHighlights && params.factualHighlights.length > 0
        ? ` Note on amenities: ${params.factualHighlights[0]}.`
        : "";

    // Neutral, responsible, customizable writing assistance templates
    // Strictly adheres to FTC 16 CFR Part 465 by providing bracketed drafts rather than fake testimonials
    const templates = [
      `${params.businessName} — [Describe the ${service} you received]. [Add your personal observations regarding the staff, quality, and overall service]. [Share any recommendations or helpful tips for other customers].`,
      `${params.businessName} — [Visit Summary]: [Note what brought you in and which service you received (${service})]. [Mention how the experience went and what stood out to you personally].${fact}`,
      `${params.businessName} — [Service Feedback]: [Describe your experience with ${service}]. [Add what you would like other customers to know about your visit].`,
      `${params.businessName} — [Customer Review Draft]: [State the reason for your visit and the service received]. [Add your genuine impressions on customer care, timeliness, and results].`,
    ];

    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

    return {
      reviewText: selectedTemplate,
      targetedService: service,
      provider: "DETERMINISTIC",
      model: "neutral-writing-assistant-v2",
      latencyMs: Date.now() - startTime,
    };
  }
}
