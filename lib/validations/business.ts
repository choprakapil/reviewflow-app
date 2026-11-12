import { z } from "zod";
import { validateGoogleReviewUrl } from "../utils/google-url";

export const CreateBusinessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name cannot exceed 100 characters"),
  category: z
    .string()
    .trim()
    .min(2, "Category is required")
    .max(60, "Category cannot exceed 60 characters"),
  description: z.string().trim().max(500).optional(),
  address: z.string().trim().max(250).optional(),
  website: z.string().trim().url("Invalid website URL").optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  googleReviewUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .refine((url) => validateGoogleReviewUrl(url).isValid, {
      message: "Must be a verified Google Maps or Google Business Profile review link",
    }),
  googlePlaceId: z.string().trim().optional(),
  keywords: z.array(z.string().trim().min(1)).max(25).default([]),
  services: z.array(z.string().trim().min(1)).max(15).default([]),
  factualHighlights: z.array(z.string().trim().min(1)).max(10).default([]),
  defaultLanguage: z.string().default("en"),
  supportedLanguages: z.array(z.string()).default(["en"]),
});

export const UpdateBusinessSchema = CreateBusinessSchema.partial();

export const UpdateAIConfigSchema = z.object({
  preferredProvider: z.enum(["GEMINI", "GROQ", "CLOUDFLARE", "DETERMINISTIC"]).default("GEMINI"),
  modelName: z.string().default("gemini-2.0-flash"),
  reviewLength: z.enum(["SHORT", "MEDIUM", "LONG"]).default("MEDIUM"),
  writingStyle: z.enum(["NATURAL", "PROFESSIONAL", "ENTHUSIASTIC", "SIMPLE"]).default("NATURAL"),
  temperature: z.number().min(0.0).max(1.0).default(0.7),
  customPromptInstructions: z.string().max(1000).optional(),
  autoReplenishPool: z.boolean().default(true),
  poolTargetSize: z.number().int().min(3).max(25).default(10),
});

export type CreateBusinessInput = z.infer<typeof CreateBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof UpdateBusinessSchema>;
export type UpdateAIConfigInput = z.infer<typeof UpdateAIConfigSchema>;

