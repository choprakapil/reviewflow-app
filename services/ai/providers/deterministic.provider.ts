import { IAIService, GenerateReviewParams, GeneratedReviewOutput } from "../ai-provider.interface";

export class DeterministicProvider implements IAIService {
  readonly providerName = "DETERMINISTIC" as const;

  async generateSuggestion(params: GenerateReviewParams): Promise<GeneratedReviewOutput> {
    const startTime = Date.now();
    const service =
      params.services.length > 0
        ? params.services[Math.floor(Math.random() * params.services.length)]
        : "services";

    // When Customer Experience Questions are ON and customer provided details
    if (params.askCustomerQuestions && params.customerAnswers) {
      const answers = params.customerAnswers;
      const parts: string[] = [];
      if (answers.serviceReceived) {
        parts.push(`I used ${params.businessName} for ${answers.serviceReceived} and had a great experience.`);
      } else {
        parts.push(`Had an exceptional experience with ${params.businessName}.`);
      }
      if (answers.personalHighlight) {
        parts.push(`Their team was ${answers.personalHighlight}.`);
      } else if (params.keywords.length > 0) {
        parts.push(`The staff was ${params.keywords[0].toLowerCase()} and very easy to work with.`);
      }
      parts.push("Highly recommend them to anyone looking for quality work!");

      return {
        reviewText: parts.join(" "),
        targetedService: answers.serviceReceived || service,
        provider: "DETERMINISTIC",
        model: "neutral-writing-assistant-v2",
        latencyMs: Date.now() - startTime,
      };
    }

    // Default: Realistic, authentic customer review variations incorporating keywords & services
    const templates = [
      `Had a fantastic experience with ${params.businessName}! They helped us with ${service}, and their team was friendly, professional, and very easy to work with. Definitely recommend them to anyone!`,
      `Really impressed by the quality of work from ${params.businessName}. Their staff is professional, responsive, and attentive to every detail during our ${service} project. A 5-star experience all around!`,
      `${params.businessName} did an incredible job with ${service}. The entire process was smooth, communication was clear, and the team was a pleasure to work with. Highly recommended!`,
      `Top-notch service from ${params.businessName}! If you are looking for reliable and expert ${service}, look no further. Friendly staff and exceptional results from start to finish.`,
      `Working with ${params.businessName} for ${service} was a breeze. Prompt support, professional team, and great attention to detail. Very satisfied with the outcome!`,
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
