import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ApiResponse } from "@/lib/api-response";
import { SuggestionPoolService } from "@/services/suggestion-pool.service";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params;
    const suggestions = await prisma.reviewSuggestion.findMany({
      where: { businessId, isArchived: false },
      orderBy: { createdAt: "desc" },
    });

    return ApiResponse.success(suggestions);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params;
    const count = await SuggestionPoolService.replenishPool(businessId, 10);
    return ApiResponse.success({ replenished: count });
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}

