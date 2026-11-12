import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow public routes without authentication
  if (
    pathname === "/" ||
    pathname === "/admin/login" ||
    pathname.startsWith("/r/") ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/health" ||
    pathname === "/api/analytics/track" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/uploads/")
  ) {
    return NextResponse.next();
  }

  // 2. Check for authenticated session token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "dev-insecure-secret-for-local-testing-only-replace-in-production-12345",
  });

  // 3. Protect all other /admin/* routes
  if (pathname.startsWith("/admin") && !token) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Protect all /api/admin/* routes
  if (pathname.startsWith("/api/admin") && !token) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required to access administrative APIs.",
          details: null,
          requestId: "auth_" + Date.now().toString(36),
        },
      },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
