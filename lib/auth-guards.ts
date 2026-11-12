import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/lib/auth-secret";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/exceptions";
import { Business } from "@prisma/client";

export interface AuthenticatedUser {
  userId: string;
  role: string;
  email?: string | null;
}

/**
 * Authenticates the request and extracts the verified database user identity.
 * Rejects unauthenticated requests with HTTP 401.
 */
export async function authenticateAdmin(req: NextRequest): Promise<AuthenticatedUser> {
  const token = await getToken({
    req,
    secret: getAuthSecret(),
  });

  if (!token?.id) {
    throw new AppError("Authentication required to access administrative APIs.", "UNAUTHORIZED", 401);
  }

  return {
    userId: token.id as string,
    role: (token.role as string) || "AGENCY_ADMIN",
    email: token.email,
  };
}

/**
 * Verifies that the specified business exists and is owned by the authenticated tenant.
 * Rejects cross-tenant access attempts with HTTP 403 (or 404 if missing).
 */
export async function verifyBusinessOwnership(
  businessId: string,
  userId: string
): Promise<Business> {
  // Query with explicit row-level tenant boundary
  const ownedBusiness = await prisma.business.findFirst({
    where: {
      id: businessId,
      userId,
    },
  });

  if (ownedBusiness) {
    return ownedBusiness;
  }

  // Check if business exists under another tenant to distinguish 403 vs 404
  const existingCrossTenant = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, userId: true },
  });

  if (existingCrossTenant) {
    throw new AppError("Unauthorized access to business owned by another tenant.", "FORBIDDEN", 403);
  }

  throw new AppError("Business not found.", "NOT_FOUND", 404);
}
