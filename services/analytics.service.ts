import { prisma } from "@/lib/prisma";

export class AnalyticsService {
  /**
   * Computes portfolio-wide KPIs for an agency account.
   */
  static async getPortfolioOverview(userId: string) {
    const businesses = await prisma.business.findMany({
      where: { userId },
      select: { id: true, status: true },
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

    return {
      totalBusinesses,
      activeBusinesses,
      totalScans,
      totalCopies,
      totalRedirects: totalRedirects || totalCopies, // copies trigger redirects
      conversionRate: Number(conversionRate),
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

