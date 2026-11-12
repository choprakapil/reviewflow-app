/**
 * Secret management for NextAuth.
 * Isolated from bcrypt and prisma to allow safe execution in Next.js Edge Runtime (middleware).
 */

export function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  // When deployed to production, enforce strict secret validation
  // Development insecure defaults must never be accepted in production
  if (isProduction) {
    if (!secret || secret.trim().length < 32 || secret.includes("dev-insecure-secret")) {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION ERROR: NEXTAUTH_SECRET must be configured with a secure, random string (min 32 characters) in production. Generate one with: openssl rand -hex 32"
      );
    }
    return secret;
  }

  // Development / test fallback only
  return secret || "dev-insecure-secret-for-local-testing-only-replace-in-production-12345";
}

