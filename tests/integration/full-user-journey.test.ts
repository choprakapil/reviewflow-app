import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { BusinessService } from "@/services/business.service";
import { SuggestionPoolService } from "@/services/suggestion-pool.service";
import { QRGeneratorService } from "@/services/qr/qr-generator.service";
import { AnalyticsService } from "@/services/analytics.service";
import { POST as trackBeacon } from "@/app/api/analytics/track/route";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

describe.sequential("ReviewFlow End-to-End User Journey Integration Suite", () => {
  const adminEmail = "journey-admin@reviewflow.io";
  let adminUserId: string;
  let testBusinessId: string;
  let testBusinessSlug: string;

  beforeAll(async () => {
    // 1. Setup Admin Account in PostgreSQL
    const passwordHash = await bcrypt.hash("JourneyPass123!", 10);
    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash, isActive: true },
      create: {
        email: adminEmail,
        passwordHash,
        fullName: "Journey Test Admin",
        role: "AGENCY_ADMIN",
        isActive: true,
      },
    });
    adminUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test records
    if (testBusinessId) {
      await prisma.business.deleteMany({ where: { id: testBusinessId } });
    }
    await prisma.user.deleteMany({ where: { id: adminUserId } });
  });

  it("Step 1: Admin creates business with AI configuration and QR matrix atomically", async () => {
    const business = await BusinessService.createBusiness(adminUserId, {
      name: "Summit Peak Dental Journey Test",
      category: "Dentistry",
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
      googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      address: "100 Alpine Way, Denver, CO",
      keywords: ["Gentle Care", "Invisalign", "Veneers", "Professional Staff"],
      services: ["Invisalign", "Crowns", "Teeth Whitening"],
      factualHighlights: ["Modern clinic", "Attentive staff"],
      defaultLanguage: "en",
      supportedLanguages: ["en"],
    });

    testBusinessId = business.id;
    testBusinessSlug = business.slug;

    expect(business.id).toBeDefined();
    expect(business.slug).toContain("summit-peak-dental-journey-test");
    expect(business.userId).toBe(adminUserId);
    expect(business.status).toBe("ACTIVE");

    // Verify relations in DB
    const qrRecord = await prisma.qRCode.findUnique({
      where: { businessId: business.id },
    });
    expect(qrRecord).toBeDefined();
    expect(qrRecord?.permanentShortUrl).toBe(`/r/${business.slug}`);

    const aiConfig = await prisma.aIConfiguration.findUnique({
      where: { businessId: business.id },
    });
    expect(aiConfig).toBeDefined();
    expect(aiConfig?.reviewLength).toBe("MEDIUM");
  });

  it("Step 2: Admin generates and retrieves QR matrix assets (SVG and PNG)", async () => {
    const svg = await QRGeneratorService.generateSvg({
      url: `http://localhost:3000/r/${testBusinessSlug}`,
      foregroundColor: "#1e3a8a",
      backgroundColor: "#ffffff",
    });

    const pngDataUrl = await QRGeneratorService.generateDataUrl({
      url: `http://localhost:3000/r/${testBusinessSlug}`,
      foregroundColor: "#1e3a8a",
      backgroundColor: "#ffffff",
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("#1e3a8a");
    expect(pngDataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it("Step 3: Suggestion pool is replenished with compliant review drafts", async () => {
    await SuggestionPoolService.replenishPool(testBusinessId, 3);

    const suggestions = await prisma.reviewSuggestion.findMany({
      where: { businessId: testBusinessId, isArchived: false },
    });

    expect(suggestions.length).toBeGreaterThanOrEqual(1);
    const firstDraft = suggestions[0].suggestionText;
    expect(firstDraft).toBeDefined();
    expect(firstDraft.length).toBeGreaterThan(20);
    // Verified compliance: contains bracketed placeholder assistance
    expect(firstDraft).toMatch(/\[.*\]/);
  });

  it("Step 4: Customer opens public landing page and retrieves active suggestion", async () => {
    const business = await BusinessService.getBusinessBySlug(testBusinessSlug);
    expect(business).toBeDefined();
    expect(business?.name).toBe("Summit Peak Dental Journey Test");

    const suggestion = await SuggestionPoolService.getActiveSuggestion(testBusinessId);
    expect(suggestion).toBeDefined();
    expect(suggestion?.suggestionText).toBeDefined();
  });

  it("Step 5: Customer interaction telemetry beacon tracks full conversion funnel", async () => {
    const clientIp = "198.51.100.42";

    // 5a: QR Scan event
    const scanReq = new NextRequest("http://localhost:3000/api/analytics/track", {
      method: "POST",
      headers: {
        "x-forwarded-for": clientIp,
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      },
      body: JSON.stringify({
        businessSlug: testBusinessSlug,
        eventType: "QR_SCAN",
      }),
    });
    const scanRes = await trackBeacon(scanReq);
    expect(scanRes.status).toBe(204);

    // 5b: Suggestion Copied event
    const copyReq = new NextRequest("http://localhost:3000/api/analytics/track", {
      method: "POST",
      headers: {
        "x-forwarded-for": clientIp,
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      },
      body: JSON.stringify({
        businessSlug: testBusinessSlug,
        eventType: "COPY_AND_REDIRECT_CLICK",
        copySuccess: true,
      }),
    });
    const copyRes = await trackBeacon(copyReq);
    expect(copyRes.status).toBe(204);

    // 5c: Google Redirect event
    const redirectReq = new NextRequest("http://localhost:3000/api/analytics/track", {
      method: "POST",
      headers: {
        "x-forwarded-for": clientIp,
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      },
      body: JSON.stringify({
        businessSlug: testBusinessSlug,
        eventType: "GOOGLE_REDIRECT",
      }),
    });
    const redirectRes = await trackBeacon(redirectReq);
    expect(redirectRes.status).toBe(204);

    // Verify raw IP is never saved
    const savedEvents = await prisma.analyticsEvent.findMany({
      where: { businessId: testBusinessId },
    });
    expect(savedEvents.length).toBe(3);
    for (const evt of savedEvents) {
      expect(evt.hashedIp).toBeDefined();
      expect(evt.hashedIp).not.toBe(clientIp);
      expect(evt.hashedIp?.length).toBe(32); // Truncated HMAC pseudonym token
    }
  });

  it("Step 6: Analytics aggregation reflects accurate conversions and portfolio metrics", async () => {
    const funnel = await AnalyticsService.getBusinessFunnel(testBusinessId);
    expect(funnel).toHaveLength(2);
    expect(funnel[0].step).toBe("QR Scans");
    expect(funnel[0].count).toBeGreaterThanOrEqual(1);
    expect(funnel[1].step).toBe("Copied & Redirected");
    expect(funnel[1].count).toBeGreaterThanOrEqual(1);

    const overview = await AnalyticsService.getPortfolioOverview(adminUserId);
    expect(overview.totalBusinesses).toBe(1);
    expect(overview.activeBusinesses).toBe(1);
    expect(overview.totalScans).toBeGreaterThanOrEqual(1);
    expect(overview.totalCopies).toBeGreaterThanOrEqual(1);
    expect(overview.conversionRate).toBeGreaterThan(0);
  });

  it("Step 7: Admin archives and restores business with full status verification", async () => {
    // Archive
    const archived = await BusinessService.archiveBusiness(testBusinessId, adminUserId);
    expect(archived.status).toBe("ARCHIVED");

    // Public lookup confirms archived status
    const publicArchived = await BusinessService.getBusinessBySlug(testBusinessSlug);
    expect(publicArchived.status).toBe("ARCHIVED");

    // Restore
    const restored = await BusinessService.restoreBusiness(testBusinessId, adminUserId);
    expect(restored.status).toBe("ACTIVE");
  });
});
