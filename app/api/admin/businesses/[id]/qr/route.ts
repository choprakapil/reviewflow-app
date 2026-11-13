import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { authenticateAdmin, verifyBusinessOwnership } from "@/lib/auth-guards";
import { QRGeneratorService } from "@/services/qr/qr-generator.service";
import { prisma } from "@/lib/prisma";

function getPublicBaseUrl(req: NextRequest): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
  const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const basePath = process.env.NEXT_BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || "";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}${basePath}`.replace(/\/$/, "");
  }

  const origin = req.nextUrl.origin || "http://localhost:3000";
  return `${origin}${basePath}`.replace(/\/$/, "");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params;
    const { userId } = await authenticateAdmin(req);
    const business = await verifyBusinessOwnership(businessId, userId);

    const baseUrl = getPublicBaseUrl(req);
    const landingUrl = `${baseUrl}/r/${business.slug}`;

    const qrConfig = await prisma.qRCode.findUnique({
      where: { businessId },
    });

    const svg = await QRGeneratorService.generateSvg({
      url: landingUrl,
      foregroundColor: qrConfig?.foregroundColor || "#000000",
      backgroundColor: qrConfig?.backgroundColor || "#FFFFFF",
    });

    const pngDataUrl = await QRGeneratorService.generateDataUrl({
      url: landingUrl,
      foregroundColor: qrConfig?.foregroundColor || "#000000",
      backgroundColor: qrConfig?.backgroundColor || "#FFFFFF",
      width: 1024,
    });

    return ApiResponse.success({
      businessId,
      landingUrl,
      svg,
      pngDataUrl,
      config: qrConfig,
    });
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params;
    const { userId } = await authenticateAdmin(req);
    await verifyBusinessOwnership(businessId, userId);

    const body = await req.json();
    const { foregroundColor, backgroundColor, errorCorrectionLevel } = body;

    const updatedQr = await prisma.qRCode.upsert({
      where: { businessId },
      update: {
        ...(foregroundColor ? { foregroundColor } : {}),
        ...(backgroundColor ? { backgroundColor } : {}),
        ...(errorCorrectionLevel ? { errorCorrectionLevel } : {}),
      },
      create: {
        businessId,
        foregroundColor: foregroundColor || "#000000",
        backgroundColor: backgroundColor || "#FFFFFF",
        errorCorrectionLevel: errorCorrectionLevel || "M",
        permanentShortUrl: `/r/${businessId}`,
      },
    });

    return ApiResponse.success(updatedQr);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}
