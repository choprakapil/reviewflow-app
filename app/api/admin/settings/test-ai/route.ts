import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth-guards";
import { AIOrchestrator } from "@/services/ai/ai-orchestrator.service";
import { z } from "zod";

const TestAISchema = z.object({
  geminiKey: z.string().trim().optional(),
  groqKey: z.string().trim().optional(),
  businessName: z.string().trim().optional(),
  category: z.string().trim().optional(),
  services: z.array(z.string()).optional(),
  targetService: z.string().trim().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await authenticateAdmin(req);

    const body = await req.json().catch(() => ({}));
    const validated = TestAISchema.parse(body);

    const orchestrator = new AIOrchestrator(validated.geminiKey, validated.groqKey);

    const startTime = Date.now();
    const result = await orchestrator.generateWithFailover("test_sandbox_bench", {
      businessName: validated.businessName || "Apex Cosmetic Dental Studio",
      category: validated.category || "Cosmetic Dentistry",
      services: validated.services || [
        "Invisalign Clear Aligners",
        "Porcelain Veneers",
        "Professional Teeth Whitening",
      ],
      keywords: ["Gentle Care", "Modern Clinic", "Attentive Team"],
      reviewLength: "MEDIUM",
      writingStyle: "NATURAL",
      language: "en",
    });

    const elapsed = Date.now() - startTime;

    return ApiResponse.success({
      providerUsed: result.provider,
      model: result.model,
      latencyMs: elapsed,
      sampleReviewText: result.reviewText,
      targetedService: result.targetedService || "General Service",
    });
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}
