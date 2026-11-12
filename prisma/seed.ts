import { PrismaClient, Role, BusinessStatus, AIProvider, ReviewLength, WritingStyle } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial database...");

  // 1. Create Super Admin User
  const adminPasswordHash = await bcrypt.hash("AdminPass123!", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@reviewflow.io" },
    update: {},
    create: {
      id: "usr_agency_admin_001",
      email: "admin@reviewflow.io",
      passwordHash: adminPasswordHash,
      fullName: "Super Agency Admin",
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log(`Created Super Admin user: ${adminUser.email}`);

  // 2. Create Demo Business: Apex Cosmetic Dental Studio
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
      description: "State-of-the-art cosmetic and restorative dental studio located in San Francisco.",
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
          customPromptInstructions: "Emphasize staff friendliness and comfort.",
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
              "I had a fantastic experience at Apex Dental Studio for my teeth whitening. The entire staff was warm, gentle, and the results exceeded my expectations. Loved the free patient parking in the rear as well. Highly recommend Dr. Sarah!",
            language: "en",
            lengthCategory: ReviewLength.MEDIUM,
            targetedService: "Teeth Whitening",
            providerUsed: "GEMINI",
            modelUsed: "gemini-2.0-flash",
            timesServed: 12,
            timesCopied: 7,
          },
          {
            suggestionText:
              "Easily the most comfortable dental visit I've ever had. Painless cleaning, super modern clinic with massage chairs, and zero wait time. Apex Dental sets the standard for dental care in San Francisco.",
            language: "en",
            lengthCategory: ReviewLength.SHORT,
            targetedService: "Routine Hygiene",
            providerUsed: "GROQ",
            modelUsed: "llama-3.1-70b-versatile",
            timesServed: 8,
            timesCopied: 5,
          },
        ],
      },
    },
  });

  console.log(`Created demo client business: ${business.name} (slug: ${business.slug})`);
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

