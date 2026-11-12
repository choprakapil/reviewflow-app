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
    const userId = (token?.id as string) || "usr_agency_admin_001";

    const archived = await BusinessService.archiveBusiness(id, userId);
    return ApiResponse.success(archived);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}

