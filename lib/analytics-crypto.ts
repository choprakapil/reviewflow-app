import crypto from "crypto";

/**
 * Derives a dynamic, server-keyed daily salt for IP pseudonymization.
 *
 * COMPLIANCE & PRIVACY NOTICE:
 * In accordance with GDPR Article 4(5) & Recital 26, keyed daily hashing represents
 * cryptographic pseudonymization rather than absolute irreversible anonymization.
 * Rotating daily with a server-side HMAC prevents persistent cross-day consumer profiling
 * while enabling same-day unique scan deduplication.
 */
export function getDailyKeyedSalt(dateString?: string): string {
  const utcDate = dateString || new Date().toISOString().slice(0, 10);
  const serverSecret =
    process.env.ANALYTICS_SALT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "fallback-telemetry-server-key-rotate-in-production";

  return crypto.createHmac("sha256", serverSecret).update(utcDate).digest("hex");
}

export function pseudonymizeIp(rawIp: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(rawIp).digest("hex").slice(0, 32);
}
