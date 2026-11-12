import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ApiResponse } from "@/lib/api-response";
import { QRGeneratorService } from "@/services/qr/qr-generator.service";
import { BusinessService } from "@/services/business.service";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = (token?.id as string) || "usr_agency_admin_001";

    const business = await BusinessService.getBusinessById(businessId, userId);
    const origin = req.nextUrl.origin || "http://localhost:3000";
    const landingUrl = `${origin}/r/${business.slug}`;

    const svg = await QRGeneratorService.generateSvg({
      url: landingUrl,
      foregroundColor: business.qrCode?.foregroundColor || "#000000",
      backgroundColor: business.qrCode?.backgroundColor || "#FFFFFF",
    });

    const pngDataUrl = await QRGeneratorService.generateDataUrl({
      url: landingUrl,
      foregroundColor: business.qrCode?.foregroundColor || "#000000",
      backgroundColor: business.qrCode?.backgroundColor || "#FFFFFF",
      width: 1024,
    });

    return ApiResponse.success({
      businessId,
      landingUrl,
      svg,
      pngDataUrl,
      config: business.qrCode,
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
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = (token?.id as string) || "usr_agency_admin_001";

    await BusinessService.getBusinessById(businessId, userId);

    const body = await req.json();
    const { foregroundColor, backgroundColor, errorCorrectionLevel } = body;

    const updatedQr = await prisma.qRCode.update({
      where: { businessId },
      data: {
        ...(foregroundColor ? { foregroundColor } : {}),
        ...(backgroundColor ? { backgroundColor } : {}),
        ...(errorCorrectionLevel ? { errorCorrectionLevel } : {}),
      },
    });

    return ApiResponse.success(updatedQr);
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}

