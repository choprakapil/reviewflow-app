import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit";
import crypto from "crypto";

const DAILY_SALT = new Date().toISOString().slice(0, 10) + "-reviewflow-salt";

export async function POST(req: NextRequest) {
  try {
    const rawIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // Rate limiting defense
    const rl = await rateLimit(`track:${rawIp}`, RateLimitPresets.TRACKING_BEACON);
    if (!rl.success) {
      return new NextResponse(null, {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, rl.reset - Math.floor(Date.now() / 1000))),
        },
      });
    }

    let body: {
      businessSlug?: string;
      eventType?: string;
      metadata?: Record<string, unknown>;
    };

    const text = await req.text();
    try {
      body = JSON.parse(text);
    } catch {
      return new NextResponse(null, { status: 400 });
    }

    const { businessSlug, eventType = "QR_SCAN", metadata } = body;
    if (!businessSlug) {
      return new NextResponse(null, { status: 400 });
    }

    // Lookup business by slug
    const business = await prisma.business.findUnique({
      where: { slug: businessSlug },
      select: { id: true },
    });

    if (!business) {
      return new NextResponse(null, { status: 404 });
    }

    // IP Anonymization: Hash with daily salt
    const hashedIp = crypto.createHash("sha256").update(rawIp + DAILY_SALT).digest("hex").slice(0, 32);

    // Geo-IP extraction from edge headers
    const country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "US";
    const city = req.headers.get("x-vercel-ip-city") || undefined;

    // User-Agent parsing
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

    // Asynchronous record insertion
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
        metadata: metadata ? (metadata as unknown as object) : undefined,
      },
    });

    // 204 No Content for beacons
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[Analytics Track Error]:", err);
    return new NextResponse(null, { status: 500 });
  }
}

