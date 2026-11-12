import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ApiResponse } from "@/lib/api-response";
import { AnalyticsService } from "@/services/analytics.service";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = (token?.id as string) || "usr_agency_admin_001";

    const overview = await AnalyticsService.getPortfolioOverview(userId);
    return ApiResponse.success(overview);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}

