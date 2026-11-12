import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ApiResponse } from "@/lib/api-response";
import { UpdateBusinessSchema } from "@/lib/validations/business";
import { BusinessService } from "@/services/business.service";

export async function GET(
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
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return ApiResponse.error("Authentication required to access administrative APIs", "UNAUTHORIZED", 401);
    }
    const userId = token.id as string;

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
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return ApiResponse.error("Authentication required to access administrative APIs", "UNAUTHORIZED", 401);
    }
    const userId = token.id as string;

    await BusinessService.hardDeleteBusiness(id, userId);
    return ApiResponse.success({ deleted: true, id });
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}

