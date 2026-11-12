export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

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

  // SVG: Must be textual XML containing <svg
  if (mimeType === "image/svg+xml") {
    const text = buffer.toString("utf-8", 0, Math.min(buffer.length, 1024)).toLowerCase();
    return text.includes("<svg") || (text.includes("<?xml") && text.includes("<svg"));
  }

  return false;
}

export function sanitizeSvg(svgContent: string): string {
  return svgContent
    // Remove <script> tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove inline event handlers (onload, onerror, onclick, etc.)
    .replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "")
    // Remove javascript: URLs
    .replace(/(href|xlink:href)\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, "");
}
