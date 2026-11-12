import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ApiResponse } from "@/lib/api-response";
import { BusinessService } from "@/services/business.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return ApiResponse.error("Authentication required to access administrative APIs", "UNAUTHORIZED", 401);
    }
    const userId = token.id as string;

    const restored = await BusinessService.restoreBusiness(id, userId);
    return ApiResponse.success(restored);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}

