-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'AGENCY_ADMIN', 'STAFF_VIEWER');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AIProvider" AS ENUM ('GEMINI', 'GROQ', 'CLOUDFLARE', 'DETERMINISTIC');

-- CreateEnum
CREATE TYPE "ReviewLength" AS ENUM ('SHORT', 'MEDIUM', 'LONG');

-- CreateEnum
CREATE TYPE "WritingStyle" AS ENUM ('NATURAL', 'PROFESSIONAL', 'ENTHUSIASTIC', 'SIMPLE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'AGENCY_ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "googlePlaceId" TEXT,
    "googleReviewUrl" TEXT NOT NULL,
    "logoUrl" TEXT,
    "keywords" JSONB NOT NULL DEFAULT '[]',
    "services" JSONB NOT NULL DEFAULT '[]',
    "factualHighlights" JSONB NOT NULL DEFAULT '[]',
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "supportedLanguages" JSONB NOT NULL DEFAULT '["en"]',
    "status" "BusinessStatus" NOT NULL DEFAULT 'ACTIVE',
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConfiguration" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "preferredProvider" "AIProvider" NOT NULL DEFAULT 'GEMINI',
    "modelName" TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    "reviewLength" "ReviewLength" NOT NULL DEFAULT 'MEDIUM',
    "writingStyle" "WritingStyle" NOT NULL DEFAULT 'NATURAL',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.70,
    "customPromptInstructions" TEXT,
    "autoReplenishPool" BOOLEAN NOT NULL DEFAULT true,
    "poolTargetSize" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCode" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "permanentShortUrl" TEXT NOT NULL,
    "errorCorrectionLevel" TEXT NOT NULL DEFAULT 'M',
    "foregroundColor" TEXT NOT NULL DEFAULT '#000000',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "hasLogoCenter" BOOLEAN NOT NULL DEFAULT false,
    "qrSvgUrl" TEXT,
    "qrPngHighResUrl" TEXT,
    "printPdfUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSuggestion" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "suggestionText" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "lengthCategory" "ReviewLength" NOT NULL DEFAULT 'MEDIUM',
    "targetedService" TEXT,
    "providerUsed" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "timesServed" INTEGER NOT NULL DEFAULT 0,
    "timesCopied" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "hashedIp" TEXT,
    "country" TEXT,
    "city" TEXT,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "os" TEXT,
    "browser" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsageLog" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER NOT NULL,
    "isSuccess" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetEntity" TEXT NOT NULL,
    "targetEntityId" TEXT NOT NULL,
    "previousState" JSONB,
    "newState" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");

-- CreateIndex
CREATE INDEX "Business_slug_idx" ON "Business"("slug");

-- CreateIndex
CREATE INDEX "Business_userId_status_idx" ON "Business"("userId", "status");

-- CreateIndex
CREATE INDEX "Business_googlePlaceId_idx" ON "Business"("googlePlaceId");

-- CreateIndex
CREATE UNIQUE INDEX "AIConfiguration_businessId_key" ON "AIConfiguration"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_businessId_key" ON "QRCode"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_permanentShortUrl_key" ON "QRCode"("permanentShortUrl");

-- CreateIndex
CREATE INDEX "ReviewSuggestion_businessId_isArchived_language_idx" ON "ReviewSuggestion"("businessId", "isArchived", "language");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_businessId_createdAt_eventType_idx" ON "AnalyticsEvent"("businessId", "createdAt", "eventType");

-- CreateIndex
CREATE INDEX "AIUsageLog_businessId_createdAt_idx" ON "AIUsageLog"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConfiguration" ADD CONSTRAINT "AIConfiguration_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSuggestion" ADD CONSTRAINT "ReviewSuggestion_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsageLog" ADD CONSTRAINT "AIUsageLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

