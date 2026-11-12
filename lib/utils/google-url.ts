/**
 * Google Business Profile & Maps Review URL Utility
 */

export const ALLOWED_GOOGLE_DOMAINS = [
  "search.google.com",
  "g.page",
  "maps.google.com",
  "goo.gl",
];

export interface GoogleUrlValidationResult {
  isValid: boolean;
  normalizedUrl: string;
  placeId?: string;
  error?: string;
}

/**
 * Validates whether a given URL is a legitimate Google review link.
 */
export function validateGoogleReviewUrl(inputUrl: string): GoogleUrlValidationResult {
  if (!inputUrl || typeof inputUrl !== "string") {
    return { isValid: false, normalizedUrl: "", error: "URL cannot be empty" };
  }

  const trimmed = inputUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { isValid: false, normalizedUrl: "", error: "Malformed URL syntax" };
  }

  if (parsed.protocol !== "https:") {
    return { isValid: false, normalizedUrl: "", error: "Google review URLs must use HTTPS" };
  }

  const hostname = parsed.hostname.toLowerCase();
  const isGoogleDomain = ALLOWED_GOOGLE_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith("." + domain)
  );

  if (!isGoogleDomain) {
    return {
      isValid: false,
      normalizedUrl: "",
      error: "Must be an official Google domain (search.google.com, g.page, or maps.google.com)",
    };
  }

  // Extract Place ID if present in search params
  const placeId = parsed.searchParams.get("placeid") || undefined;

  return {
    isValid: true,
    normalizedUrl: trimmed,
    placeId,
  };
}

/**
 * Constructs a direct, fail-safe Google Local review dialog URL from a verified Place ID.
 */
export function constructReviewUrlFromPlaceId(placeId: string): string {
  const cleanPlaceId = placeId.trim();
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(cleanPlaceId)}`;
}

