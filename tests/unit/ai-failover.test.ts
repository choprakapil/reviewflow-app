import { describe, it, expect } from "vitest";
import { PromptBuilder } from "@/services/ai/prompt-builder";
import { DeterministicProvider } from "@/services/ai/providers/deterministic.provider";

describe("AI Prompt Builder & Fallback Cascade", () => {
  it("encapsulates business context in XML tags", () => {
    const prompt = PromptBuilder.buildUserPrompt({
      businessName: "Apex Dental",
      category: "Dentistry",
      services: ["Teeth Whitening"],
      keywords: ["gentle"],
      reviewLength: "MEDIUM",
      writingStyle: "NATURAL",
      language: "en",
    });

    expect(prompt).toContain("<business_context>");
    expect(prompt).toContain("Business Name: Apex Dental");
    expect(prompt).toContain("Category: Dentistry");
    expect(prompt).toContain("</business_context>");
  });

  it("deterministic fallback generates valid review without network", async () => {
    const provider = new DeterministicProvider();
    const result = await provider.generateSuggestion({
      businessName: "Apex Dental",
      category: "Dentistry",
      services: ["Invisalign"],
      keywords: ["friendly staff"],
      reviewLength: "SHORT",
      writingStyle: "NATURAL",
      language: "en",
    });

    expect(result.reviewText).toBeDefined();
    expect(result.reviewText.length).toBeGreaterThan(20);
    expect(result.reviewText).toContain("Apex Dental");
    expect(result.provider).toBe("DETERMINISTIC");
    expect(result.latencyMs).toBeLessThan(100);
  });
});

