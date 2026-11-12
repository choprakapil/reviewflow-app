import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { authenticateAdmin, verifyBusinessOwnership } from "@/lib/auth-guards";
import { QRGeneratorService } from "@/services/qr/qr-generator.service";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params;
    const { userId } = await authenticateAdmin(req);
    const business = await verifyBusinessOwnership(businessId, userId);

    const origin = req.nextUrl.origin || "http://localhost:3000";
    const landingUrl = `${origin}/r/${business.slug}`;

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
