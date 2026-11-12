import { GenerateReviewParams } from "./ai-provider.interface";

export class PromptBuilder {
  /**
   * Constructs an XML-armored system instruction.
   * Generates authentic, highly realistic, positive Google review drafts
   * tailored to the business's actual services, keywords, and tone.
   */
  static buildSystemInstruction(): string {
    return `You are an expert review writing assistant helping satisfied customers draft authentic, high-quality Google reviews for local businesses.

CRITICAL GUIDELINES:
1. Write from a genuine customer perspective in the first person ("I", "We", "My experience").
2. Write 100% complete, fluent, and ready-to-post reviews. NEVER include bracketed placeholders like "[Describe...]", "[Insert...]", or "[Add your...]".
3. Naturally incorporate the business's services and target keywords into the review so it reads seamlessly and organically.
4. Keep the review positive, authentic, and believable. Avoid over-the-top hype or robotic clichés.
5. Provide variety: generate a distinct angle each time (e.g. focusing on project quality, responsive communication, friendly staff, or overall ease of work).
6. Output strictly valid JSON matching this schema:
{
  "reviewText": "string containing the complete, ready-to-post review text",
  "targetedService": "string naming the specific service highlighted, if applicable"
}`;
  }

  /**
   * Constructs the user prompt with isolated parameters.
   */
  static buildUserPrompt(params: GenerateReviewParams): string {
    const wordCountGuideline = {
      SHORT: "1 to 2 clear sentences (25 to 45 words). Punchy and direct.",
      MEDIUM: "2 to 3 well-crafted sentences (45 to 75 words). Balanced and descriptive.",
      LONG: "3 to 4 detailed sentences (75 to 110 words). Thorough story with high recommendation.",
    }[params.reviewLength];

    const styleGuideline = {
      NATURAL: "Warm, conversational, authentic everyday customer tone",
      PROFESSIONAL: "Polite, articulate, emphasizing communication, expertise, and quality",
      ENTHUSIASTIC: "Energetic, highly positive, praising the great experience",
      SIMPLE: "Direct, plain-spoken, clear and concise language",
    }[params.writingStyle];

    // Select a service focus if available
    const selectedService =
      params.services.length > 0
        ? params.services[Math.floor(Math.random() * params.services.length)]
        : undefined;

    const angleGuideline = [
      "Focus on the friendly staff, professional team, and how easy they are to work with.",
      "Focus on the high quality of the work delivered and prompt turnaround time.",
      "Focus on clear communication, attention to requirements, and great value.",
      "Focus on overall satisfaction and giving a strong recommendation to others.",
    ][Math.floor(Math.random() * 4)];

    const customerSection =
      params.askCustomerQuestions && params.customerAnswers
        ? `\n<customer_reported_experience>
Reported Service: ${params.customerAnswers.serviceReceived || "Not specified"}
Reported Highlight: ${params.customerAnswers.personalHighlight || "Not specified"}
Reported Context: ${params.customerAnswers.visitContext || "Not specified"}
</customer_reported_experience>
Incorporate the customer's actual reported points into the review naturally.`
        : "";

    return `<business_context>
Business Name: ${params.businessName}
Category: ${params.category}
Available Services: ${params.services.join(", ") || "General Services"}
Featured Service: ${selectedService || "General Services"}
Key Strengths / Keywords: ${params.keywords.join(", ") || "N/A"}
Amenities / Highlights: ${params.factualHighlights?.join("; ") || "N/A"}
Target Language: ${params.language}
Target Length: ${wordCountGuideline}
Tone: ${styleGuideline}
Angle: ${angleGuideline}
Custom Instructions: ${params.customInstructions || "N/A"}
</business_context>${customerSection}

Generate a complete, realistic, ready-to-submit 5-star Google review draft in ${params.language}.
Do NOT output brackets, blanks, or placeholders. The review must be ready to copy and submit immediately.

Output ONLY valid JSON.`;
  }
}
