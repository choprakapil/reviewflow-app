import { prisma } from "@/lib/prisma";
import { AIOrchestrator } from "./ai/ai-orchestrator.service";
import { ReviewLength, WritingStyle } from "@prisma/client";

export class SuggestionPoolService {
  private static orchestrator = new AIOrchestrator();

  /**
   * Replenishes the pre-generated suggestion pool for a business up to the target size.
   */
  static async replenishPool(businessId: string, targetSize = 10): Promise<number> {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { aiConfig: true },
    });

    if (!business || !business.aiConfig) {
      return 0;
    }

    const currentCount = await prisma.reviewSuggestion.count({
      where: {
        businessId,
        isArchived: false,
      },
    });

    const needed = Math.max(0, targetSize - currentCount);
    if (needed === 0) return 0;

    const services = Array.isArray(business.services) ? (business.services as string[]) : [];
    const keywords = Array.isArray(business.keywords) ? (business.keywords as string[]) : [];
    const facts = Array.isArray(business.factualHighlights)
      ? (business.factualHighlights as string[])
      : [];

    let createdCount = 0;

    for (let i = 0; i < needed; i++) {
      try {
        const generated = await this.orchestrator.generateWithFailover(businessId, {
          businessName: business.name,
          category: business.category,
          services,
          keywords,
          factualHighlights: facts,
          reviewLength: business.aiConfig.reviewLength as ReviewLength,
          writingStyle: business.aiConfig.writingStyle as WritingStyle,
          language: business.defaultLanguage,
          customInstructions: business.aiConfig.customPromptInstructions || undefined,
        });

        await prisma.reviewSuggestion.create({
          data: {
            businessId,
            suggestionText: generated.reviewText,
            language: business.defaultLanguage,
            lengthCategory: business.aiConfig.reviewLength,
            targetedService: generated.targetedService || null,
            providerUsed: generated.provider,
            modelUsed: generated.model,
          },
        });

        createdCount++;
      } catch (err) {
        console.error(`Failed to generate pool item ${i + 1}:`, err);
      }
    }

    return createdCount;
  }

  /**
   * Retrieves an active suggestion from the pool, selecting the least served.
   */
  static async getActiveSuggestion(businessId: string, language = "en") {
    let suggestion = await prisma.reviewSuggestion.findFirst({
      where: {
        businessId,
        isArchived: false,
        language,
      },
      orderBy: { timesServed: "asc" },
    });

    // If pool is empty, generate an instant neutral writing draft fallback
    if (!suggestion) {
      const business = await prisma.business.findUnique({ where: { id: businessId } });
      const fallbackText = business
        ? `${business.name} — [Describe the service you received]. [Add what you personally experienced and what you would like others to know].`
        : "[Business Name] — [Describe the service you received]. [Add what you personally experienced and what you would like others to know].";

      suggestion = await prisma.reviewSuggestion.create({
        data: {
          businessId,
          suggestionText: fallbackText,
          language,
          lengthCategory: "SHORT",
          providerUsed: "DETERMINISTIC",
          modelUsed: "neutral-writing-assistant-v2",
          timesServed: 1,
        },
      });

      return suggestion;
    }

    // Increment timesServed counter
    await prisma.reviewSuggestion.update({
      where: { id: suggestion.id },
      data: { timesServed: { increment: 1 } },
    });

    return suggestion;
  }

  /**
   * Records a copy conversion event on the suggestion item.
   */
  static async recordSuggestionCopied(suggestionId: string) {
    return await prisma.reviewSuggestion.update({
      where: { id: suggestionId },
      data: { timesCopied: { increment: 1 } },
    });
  }
}

