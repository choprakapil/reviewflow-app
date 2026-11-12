import { PrismaClient, Role, BusinessStatus, AIProvider, ReviewLength, WritingStyle } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial database...");

  // 1. Create or Update Super Admin User
  // Administrator password MUST be supplied via ADMIN_BOOTSTRAP_PASSWORD or secure random bootstrap
  const bootstrapPassword =
    process.env.ADMIN_BOOTSTRAP_PASSWORD ||
    (process.env.NODE_ENV === "production"
      ? crypto.randomBytes(16).toString("hex")
      : "AdminPass123!");

  const adminPasswordHash = await bcrypt.hash(bootstrapPassword, 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@reviewflow.io" },
    update: {
      passwordHash: adminPasswordHash,
      isActive: true,
    },
    create: {
      id: "usr_agency_admin_001",
      email: "admin@reviewflow.io",
      passwordHash: adminPasswordHash,
      fullName: "Super Agency Admin",
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log(`Configured Super Admin user account: ${adminUser.email}`);

  // 2. Create Demo Business: Apex Cosmetic Dental Studio (Identified Synthetic Demo)
  const businessSlug = "apex-dental";
  const business = await prisma.business.upsert({
    where: { slug: businessSlug },
    update: {},
    create: {
      id: "bus_apex_dental_001",
      userId: adminUser.id,
      name: "Apex Cosmetic Dental Studio",
      slug: businessSlug,
      category: "Dentistry",
      description: "Synthetic demo cosmetic and restorative dental studio located in San Francisco.",
      address: "124 Market St, Suite 200, San Francisco, CA 94105",
      website: "https://apexdentalstudio.example.com",
      phone: "+1 (415) 555-0199",
      googlePlaceId: "ChIJd8BlQ2B-j4AR29pQz8WfV0U",
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJd8BlQ2B-j4AR29pQz8WfV0U",
      keywords: ["gentle dentist", "teeth whitening", "invisalign provider", "painless cleaning"],
      services: ["Teeth Whitening", "Invisalign", "Porcelain Veneers", "Routine Hygiene"],
      factualHighlights: [
        "Free validated patient parking behind building",
        "Modern painless ultrasonic cleaning technology",
        "Heated massage chairs in treatment suites",
      ],
      defaultLanguage: "en",
      supportedLanguages: ["en", "es", "hi"],
      status: BusinessStatus.ACTIVE,
      aiConfig: {
        create: {
          preferredProvider: AIProvider.GEMINI,
          modelName: "gemini-2.0-flash",
          reviewLength: ReviewLength.MEDIUM,
          writingStyle: WritingStyle.NATURAL,
          temperature: 0.7,
          customPromptInstructions: "Draft structured, customizable review outlines with bracketed placeholders.",
          autoReplenishPool: true,
          poolTargetSize: 10,
        },
      },
      qrCode: {
        create: {
          permanentShortUrl: "https://reviewflow.io/r/apex-dental",
          errorCorrectionLevel: "M",
          foregroundColor: "#000000",
          backgroundColor: "#FFFFFF",
          isActive: true,
        },
      },
      suggestions: {
        create: [
          {
            suggestionText:
              "Apex Cosmetic Dental Studio — [Describe the dental service you received, such as Teeth Whitening]. [Add what you personally experienced regarding staff care, comfort, and clinic amenities]. [Include any helpful advice for future patients].",
            language: "en",
            lengthCategory: ReviewLength.MEDIUM,
            targetedService: "Teeth Whitening",
            providerUsed: "DETERMINISTIC",
            modelUsed: "neutral-writing-assistant-v2",
            timesServed: 0,
            timesCopied: 0,
          },
          {
            suggestionText:
              "Apex Cosmetic Dental Studio — [Routine Hygiene Visit]: [State your impressions of the hygiene appointment and ultrasonic cleaning]. [Mention the validated parking in the rear or facility comfort].",
            language: "en",
            lengthCategory: ReviewLength.SHORT,
            targetedService: "Routine Hygiene",
            providerUsed: "DETERMINISTIC",
            modelUsed: "neutral-writing-assistant-v2",
            timesServed: 0,
            timesCopied: 0,
          },
        ],
      },
    },
  });

  console.log(`Configured synthetic demo business: ${business.name} (slug: ${business.slug})`);
  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
