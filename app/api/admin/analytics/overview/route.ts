import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ApiResponse } from "@/lib/api-response";
import { AnalyticsService } from "@/services/analytics.service";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return ApiResponse.error("Authentication required to access administrative APIs", "UNAUTHORIZED", 401);
    }
    const userId = token.id as string;

    const overview = await AnalyticsService.getPortfolioOverview(userId);
    return ApiResponse.success(overview);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}

