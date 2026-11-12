import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth-guards";
import { StorageService } from "@/services/storage/storage.service";
import { ValidationError } from "@/lib/exceptions";
import {
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  verifyMagicBytes,
  sanitizeSvg,
} from "@/lib/utils/file-upload";

export async function POST(req: NextRequest) {
  try {
    await authenticateAdmin(req);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      throw new ValidationError("No valid file provided in request");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError("File size exceeds maximum allowed limit of 2MB");
    }

    const mimeType = file.type;
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new ValidationError(
        `Unsupported file type '${mimeType}'. Allowed types: PNG, JPEG, SVG, WebP`
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    if (!verifyMagicBytes(buffer, mimeType)) {
      throw new ValidationError("File content header does not match declared MIME type");
    }

    // Sanitize SVG payloads
    if (mimeType === "image/svg+xml") {
      const sanitized = sanitizeSvg(buffer.toString("utf-8"));
      buffer = Buffer.from(sanitized, "utf-8");
    }

    const originalName = (file as File).name || "logo.png";
    const stored = await StorageService.save(buffer, originalName, mimeType);

    return ApiResponse.success(stored, 201);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}
