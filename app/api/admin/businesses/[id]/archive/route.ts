import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth-guards";
import { BusinessService } from "@/services/business.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await authenticateAdmin(req);

    const archived = await BusinessService.archiveBusiness(id, userId);
    return ApiResponse.success(archived);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}
