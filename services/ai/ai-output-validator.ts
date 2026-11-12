import { z } from "zod";

/**
 * Standard schema for AI review writing assistant suggestions.
 * Strictly enforces length bounds and required fields.
 */
export const AISuggestionOutputSchema = z.object({
  reviewText: z
    .string()
    .min(10, "Review draft must be at least 10 characters")
    .max(500, "Review draft cannot exceed 500 characters")
    .trim(),
  targetedService: z.string().max(100).optional(),
});

export type ValidatedAISuggestion = z.infer<typeof AISuggestionOutputSchema>;

/**
 * List of banned hallucinated / fraudulent claims that violate Google policies and medical/safety guidelines.
 */
const FABRICATION_PATTERNS = [
  /miracle cure/i,
  /dr\.?\s+[a-z]+ cured my/i,
  /paid review/i,
  /free gift in exchange/i,
];

export class AIOutputValidator {
  /**
   * Safely parses, validates, and cleans raw LLM output strings.
   * Throws descriptive validation errors on malformed JSON, schema violation, or policy breach.
   */
  static parseAndValidate(rawOutput: string): ValidatedAISuggestion {
    if (!rawOutput || typeof rawOutput !== "string") {
      throw new Error("AI output was empty or invalid type.");
    }

    // 1. Attempt JSON parsing
    let parsedJson: unknown;
    try {
      // Clean possible markdown code fences (```json ... ```)
      const cleaned = rawOutput
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      parsedJson = JSON.parse(cleaned);
    } catch {
      throw new Error(`Malformed JSON output from AI provider: "${rawOutput.slice(0, 100)}..."`);
    }

    // 2. Schema validation with Zod
    const validation = AISuggestionOutputSchema.safeParse(parsedJson);
    if (!validation.success) {
      const issueMsg = validation.error.issues.map((i) => i.message).join("; ");
      throw new Error(`AI output failed schema validation: ${issueMsg}`);
    }

    const { reviewText, targetedService } = validation.data;

    // 3. Compliance inspection against fabricated testimonial claims
    for (const pattern of FABRICATION_PATTERNS) {
      if (pattern.test(reviewText)) {
        throw new Error(
          `AI output rejected due to fabricated testimonial policy violation (matched: ${pattern})`
        );
      }
    }

    return {
      reviewText,
      targetedService,
    };
  }
}

