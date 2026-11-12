import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ApiResponse } from "@/lib/api-response";
import { CreateBusinessSchema } from "@/lib/validations/business";
import { BusinessService } from "@/services/business.service";
import { BusinessStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return ApiResponse.error("Authentication required to access administrative APIs", "UNAUTHORIZED", 401);
    }
    const userId = token.id as string;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as BusinessStatus | undefined;
    const search = searchParams.get("search") || undefined;

    const businesses = await BusinessService.getBusinesses(userId, status, search);
    return ApiResponse.success(businesses);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return ApiResponse.error("Authentication required to access administrative APIs", "UNAUTHORIZED", 401);
    }
    const userId = token.id as string;

    const body = await req.json();
    const validatedData = CreateBusinessSchema.parse(body);

    const business = await BusinessService.createBusiness(userId, validatedData);
    return ApiResponse.success(business, 201);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}

