import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, RateLimitPresets, extractClientIp } from "@/lib/rate-limit";
import { getDailyKeyedSalt, pseudonymizeIp } from "@/lib/analytics-crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";

/**
 * Explicit allowlist of permissible analytics telemetry event types.
 * Rejects arbitrary or malicious string injections.
 */
const ALLOWED_EVENT_TYPES = [
  "QR_SCAN",
  "LANDING_PAGE_VIEW",
  "COPY_AND_REDIRECT_CLICK",
  "SUGGESTION_COPIED",
  "GOOGLE_REDIRECT",
  "TRY_ANOTHER_CLICK",
  "MANUAL_COPY_OPEN",
] as const;

const AnalyticsPayloadSchema = z.object({
  businessSlug: z.string().min(1).max(100),
  eventType: z.enum(ALLOWED_EVENT_TYPES),
  copySuccess: z.boolean().optional(),
  metadata: z
    .record(z.string().max(50), z.union([z.string().max(200), z.number(), z.boolean()]))
    .optional(),
});

const MAX_BODY_BYTES = 16_384; // 16 KB strict size ceiling

export async function POST(req: NextRequest) {
  try {
    const clientIp = extractClientIp(req.headers);

    // 1. Rate Limiting Protection (120 req/min per client IP)
    const rl = await rateLimit(`track:${clientIp}`, RateLimitPresets.TRACKING_BEACON);
    if (!rl.success) {
      return new NextResponse(null, {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, rl.reset - Math.floor(Date.now() / 1000))),
        },
      });
    }

    // 2. Body size guard to prevent memory/DoS attacks
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) {
      return new NextResponse("Payload Too Large", { status: 413 });
    }

    // 3. JSON parsing guard
    let rawBody: unknown;
    try {
      rawBody = JSON.parse(text);
    } catch {
      return new NextResponse("Invalid JSON", { status: 400 });
    }

    // 4. Schema validation with strict event allowlist
    const parsed = AnalyticsPayloadSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new NextResponse("Invalid analytics payload structure", { status: 400 });
    }

    const { businessSlug, eventType, metadata } = parsed.data;

    // 5. Lookup business by slug
    const business = await prisma.business.findUnique({
      where: { slug: businessSlug },
      select: { id: true },
    });

    if (!business) {
      return new NextResponse(null, { status: 404 });
    }

    // 6. Pseudonymize IP with daily server-keyed salt (Never store raw IP)
    const dailySalt = getDailyKeyedSalt();
    const hashedIp = pseudonymizeIp(clientIp, dailySalt);

    // 7. Edge geo-telemetry extraction
    const country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "US";
    const city = req.headers.get("x-vercel-ip-city") || undefined;

    // 8. User-Agent parsing
    const userAgent = req.headers.get("user-agent") || "";
    const isMobile = /mobile|iphone|android|ipod|ipad/i.test(userAgent);
    const os = /iphone|ipad|ipod/i.test(userAgent)
      ? "iOS"
      : /android/i.test(userAgent)
      ? "Android"
      : /macintosh/i.test(userAgent)
      ? "macOS"
      : /windows/i.test(userAgent)
      ? "Windows"
      : "Other";

    const browser = /crios|chrome/i.test(userAgent)
      ? "Chrome"
      : /safari/i.test(userAgent) && !/chrome/i.test(userAgent)
      ? "Safari"
      : /firefox/i.test(userAgent)
      ? "Firefox"
      : "Mobile Browser";

    // 9. Persist validated telemetry record
    await prisma.analyticsEvent.create({
      data: {
        businessId: business.id,
        eventType,
        hashedIp,
        country,
        city,
        userAgent: userAgent.slice(0, 255),
        deviceType: isMobile ? "MOBILE" : "DESKTOP",
        os,
        browser,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[Analytics Track Error]:", err);
    return new NextResponse(null, { status: 500 });
  }
}
