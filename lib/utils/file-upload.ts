export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

/**
 * PRODUCTION HARDENING:
 * SVG uploads are strictly prohibited to eliminate 100% of XML/SVG script injection,
 * DOM XSS, and XML External Entity (XXE) attack surfaces.
 * Only verified binary raster images (PNG, JPEG, WebP) are permitted.
 */
export const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  // PNG: 89 50 4E 47
  if (mimeType === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // JPEG: FF D8 FF
  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (mimeType === "image/webp") {
    if (buffer.length < 12) return false;
    const isRiff = buffer.toString("ascii", 0, 4) === "RIFF";
    const isWebp = buffer.toString("ascii", 8, 12) === "WEBP";
    return isRiff && isWebp;
  }

  return false;
}

