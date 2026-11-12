import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth-guards";
import { UpdateBusinessSchema } from "@/lib/validations/business";
import { BusinessService } from "@/services/business.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await authenticateAdmin(req);

    const business = await BusinessService.getBusinessById(id, userId);
    return ApiResponse.success(business);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await authenticateAdmin(req);

    const body = await req.json();
    const validatedData = UpdateBusinessSchema.parse(body);

    const updated = await BusinessService.updateBusiness(id, userId, validatedData);
    return ApiResponse.success(updated);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await authenticateAdmin(req);

    await BusinessService.hardDeleteBusiness(id, userId);
    return ApiResponse.success({ deleted: true, id });
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}
