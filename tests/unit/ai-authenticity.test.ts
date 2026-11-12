import { describe, it, expect } from "vitest";
import { AIOutputValidator } from "@/services/ai/ai-output-validator";
import { DeterministicProvider } from "@/services/ai/providers/deterministic.provider";
import { PromptBuilder } from "@/services/ai/prompt-builder";

describe("AI Authenticity & Responsible Generation Suite", () => {
  const baseParams = {
    businessName: "Summit Dental Clinic",
    category: "Dentistry",
    keywords: ["teeth cleaning", "friendly clinic"],
    services: ["Routine Checkup", "Teeth Whitening"],
    factualHighlights: ["Validated patient parking in structure"],
    reviewLength: "MEDIUM" as const,
    writingStyle: "NATURAL" as const,
    language: "en",
  };

  describe("AI Output Validator", () => {
    it("accepts valid, compliant review draft framework", () => {
      const validPayload = JSON.stringify({
        reviewText: "Summit Dental Clinic — [Describe your checkup visit]. [Add personal notes on staff and comfort].",
        targetedService: "Routine Checkup",
      });

      const result = AIOutputValidator.parseAndValidate(validPayload);
      expect(result.reviewText).toContain("Summit Dental Clinic");
      expect(result.targetedService).toBe("Routine Checkup");
    });

    it("parses output wrapped in markdown JSON code fences", () => {
      const fencedPayload = "```json\n{\"reviewText\": \"Summit Dental Clinic — [Describe service received].\", \"targetedService\": \"General\"}\n```";
      const result = AIOutputValidator.parseAndValidate(fencedPayload);
      expect(result.reviewText).toBe("Summit Dental Clinic — [Describe service received].");
    });

    it("strictly rejects fabricated first-person testimonial claims", () => {
      const fakeClaimPayload = JSON.stringify({
        reviewText: "I came to Summit Dental and they gave me the best service ever! Five stars all the way!",
      });

      expect(() => AIOutputValidator.parseAndValidate(fakeClaimPayload)).toThrow(
        /fabricated testimonial policy violation/
      );
    });

    it("strictly rejects malformed JSON output", () => {
      const malformedJson = "{ reviewText: 'missing quotes and unclosed";
      expect(() => AIOutputValidator.parseAndValidate(malformedJson)).toThrow(/Malformed JSON/);
    });

    it("strictly rejects payload with missing reviewText", () => {
      const missingField = JSON.stringify({
        wrongField: "No review draft here",
      });
      expect(() => AIOutputValidator.parseAndValidate(missingField)).toThrow(/schema validation/);
    });

    it("strictly rejects excessively long output (> 500 characters)", () => {
      const excessivelyLong = JSON.stringify({
        reviewText: "A".repeat(505),
      });
      expect(() => AIOutputValidator.parseAndValidate(excessivelyLong)).toThrow(/cannot exceed 500 characters/);
    });
  });

  describe("Deterministic Fallback Authenticity", () => {
    it("generates neutral, customizable draft assistance without fabricated experiences", async () => {
      const provider = new DeterministicProvider();
      const output = await provider.generateSuggestion(baseParams);

      expect(output.provider).toBe("DETERMINISTIC");
      expect(output.reviewText).toContain(baseParams.businessName);

      // Must contain bracketed customization placeholders
      expect(output.reviewText).toMatch(/\[.*?\]/);

      // Must NEVER contain fake testimonial claims
      expect(output.reviewText).not.toMatch(/five stars/i);
      expect(output.reviewText).not.toMatch(/100% guaranteed/i);
      expect(output.reviewText).not.toMatch(/I had a wonderful experience/i);
      expect(output.reviewText).not.toMatch(/exceeded my expectations/i);
    });
  });

  describe("Prompt Builder Responsible Guardrails", () => {
    it("instructs LLM to never fabricate customer experiences or 5-star claims", () => {
      const systemInstruction = PromptBuilder.buildSystemInstruction();

      expect(systemInstruction).toContain("NEVER invent customer experiences");
      expect(systemInstruction).toContain("NEVER assume the customer received a particular service");
      expect(systemInstruction).toContain("FTC (16 CFR Part 465)");
      expect(systemInstruction).toContain("editable placeholders");
    });
  });
});

