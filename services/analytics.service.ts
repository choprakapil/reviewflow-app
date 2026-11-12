import { prisma } from "@/lib/prisma";

export class AnalyticsService {
  /**
   * Computes portfolio-wide KPIs for an agency account and per-business performance breakdown.
   */
  static async getPortfolioOverview(userId: string) {
    const businesses = await prisma.business.findMany({
      where: { userId },
      select: { id: true, name: true, slug: true, category: true, status: true },
      orderBy: { createdAt: "desc" },
    });

    const businessIds = businesses.map((b) => b.id);
    const totalBusinesses = businesses.length;
    const activeBusinesses = businesses.filter((b) => b.status === "ACTIVE").length;

    if (businessIds.length === 0) {
      return {
        totalBusinesses: 0,
        activeBusinesses: 0,
        totalScans: 0,
        totalCopies: 0,
        totalRedirects: 0,
        conversionRate: 0,
        businessesBreakdown: [],
      };
    }

    const totalScans = await prisma.analyticsEvent.count({
      where: { businessId: { in: businessIds }, eventType: "QR_SCAN" },
    });

    const totalCopies = await prisma.analyticsEvent.count({
      where: { businessId: { in: businessIds }, eventType: "COPY_AND_REDIRECT_CLICK" },
    });

    const totalRedirects = await prisma.analyticsEvent.count({
      where: { businessId: { in: businessIds }, eventType: "GOOGLE_REDIRECT" },
    });

    const conversionRate = totalScans > 0 ? ((totalCopies / totalScans) * 100).toFixed(1) : "0.0";

    // Compute breakdown for each individual business
    const businessesBreakdown = await Promise.all(
      businesses.map(async (b) => {
        const scans = await prisma.analyticsEvent.count({
          where: { businessId: b.id, eventType: "QR_SCAN" },
        });
        const copies = await prisma.analyticsEvent.count({
          where: { businessId: b.id, eventType: "COPY_AND_REDIRECT_CLICK" },
        });
        const rate = scans > 0 ? ((copies / scans) * 100).toFixed(1) : "0.0";

        return {
          id: b.id,
          name: b.name,
          slug: b.slug,
          category: b.category,
          status: b.status,
          totalScans: scans,
          totalCopies: copies,
          conversionRate: Number(rate),
        };
      })
    );

    return {
      totalBusinesses,
      activeBusinesses,
      totalScans,
      totalCopies,
      totalRedirects: totalRedirects || totalCopies,
      conversionRate: Number(conversionRate),
      businessesBreakdown,
    };
  }

  /**
   * Computes detailed per-business analytics, funnels, and event streams.
   */
  static async getBusinessDetailedAnalytics(businessId: string, userId: string) {
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId },
      select: { id: true, name: true, slug: true, category: true, status: true },
    });

    if (!business) {
      throw new Error("Business not found or access denied");
    }

    const totalScans = await prisma.analyticsEvent.count({
      where: { businessId, eventType: "QR_SCAN" },
    });

    const totalCopies = await prisma.analyticsEvent.count({
      where: { businessId, eventType: "COPY_AND_REDIRECT_CLICK" },
    });

    const totalRedirects = await prisma.analyticsEvent.count({
      where: { businessId, eventType: "GOOGLE_REDIRECT" },
    });

    const conversionRate = totalScans > 0 ? ((totalCopies / totalScans) * 100).toFixed(1) : "0.0";

    const funnel = [
      { step: "In-Store QR Scans", count: totalScans, dropoff: "0%" },
      {
        step: "Review Drafts Copied",
        count: totalCopies,
        dropoff: totalScans > 0 ? `${(100 - (totalCopies / totalScans) * 100).toFixed(1)}%` : "0%",
      },
      {
        step: "Google Reviews Opened",
        count: totalRedirects || totalCopies,
        dropoff: totalCopies > 0 ? `${(100 - ((totalRedirects || totalCopies) / totalCopies) * 100).toFixed(1)}%` : "0%",
      },
    ];

    const recentEvents = await prisma.analyticsEvent.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        eventType: true,
        deviceType: true,
        browser: true,
        os: true,
        createdAt: true,
      },
    });

    return {
      business,
      totalScans,
      totalCopies,
      totalRedirects: totalRedirects || totalCopies,
      conversionRate: Number(conversionRate),
      funnel,
      recentEvents,
    };
  }

  /**
   * Computes funnel drop-off metrics for a specific business.
   */
  static async getBusinessFunnel(businessId: string) {
    const scans = await prisma.analyticsEvent.count({
      where: { businessId, eventType: "QR_SCAN" },
    });

    const copies = await prisma.analyticsEvent.count({
      where: { businessId, eventType: "COPY_AND_REDIRECT_CLICK" },
    });

    return [
      { step: "QR Scans", count: scans, dropoff: "0%" },
      {
        step: "Copied & Redirected",
        count: copies,
        dropoff: scans > 0 ? `${(100 - (copies / scans) * 100).toFixed(1)}%` : "0%",
      },
    ];
  }
}
