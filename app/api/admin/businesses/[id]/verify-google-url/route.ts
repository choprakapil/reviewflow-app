import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { authenticateAdmin, verifyBusinessOwnership } from "@/lib/auth-guards";
import { validateGoogleReviewUrl } from "@/lib/utils/google-url";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params;
    const { userId } = await authenticateAdmin(req);
    await verifyBusinessOwnership(businessId, userId);

    const body = await req.json();
    const { url } = body;

    const validation = validateGoogleReviewUrl(url);
    if (!validation.isValid) {
      return ApiResponse.error(validation.error || "Invalid Google review URL", "INVALID_URL", 422);
    }

    return ApiResponse.success({
      isValid: true,
      normalizedUrl: validation.normalizedUrl,
      placeId: validation.placeId || null,
    });
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}
