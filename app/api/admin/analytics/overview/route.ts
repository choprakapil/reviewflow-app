import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth-guards";
import { AnalyticsService } from "@/services/analytics.service";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await authenticateAdmin(req);

    const overview = await AnalyticsService.getPortfolioOverview(userId);
    return ApiResponse.success(overview);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}
