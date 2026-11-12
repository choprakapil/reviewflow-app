import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { authenticateAdmin, verifyBusinessOwnership } from "@/lib/auth-guards";
import { StorageService } from "@/services/storage/storage.service";
import { ValidationError } from "@/lib/exceptions";
import { prisma } from "@/lib/prisma";
import {
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  verifyMagicBytes,
} from "@/lib/utils/file-upload";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await authenticateAdmin(req);

    const formData = await req.formData();
    const file = formData.get("file");
    const businessId = formData.get("businessId") as string | null;

    if (!file || !(file instanceof Blob)) {
      throw new ValidationError("No valid file provided in request");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError("File size exceeds maximum allowed limit of 2MB");
    }

    const mimeType = file.type;
    if (mimeType === "image/svg+xml") {
      throw new ValidationError(
        "SVG upload is prohibited for security compliance. Please upload a verified raster image (PNG, JPEG, or WebP)."
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new ValidationError(
        `Unsupported file type '${mimeType}'. Allowed types: PNG, JPEG, WebP`
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!verifyMagicBytes(buffer, mimeType)) {
      throw new ValidationError("File content header does not match declared MIME type");
    }

    // Tenant authorization check if businessId is supplied
    if (businessId) {
      await verifyBusinessOwnership(businessId, userId);
    }

    const originalName = (file as File).name || "logo.png";
    const stored = await StorageService.save(buffer, originalName, mimeType);

    if (businessId) {
      await prisma.business.update({
        where: { id: businessId },
        data: { logoUrl: stored.url },
      });
    }

    return ApiResponse.success(stored, 201);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}
