import { ApiResponse } from "@/lib/api-response";

export async function GET(req: Request) {
  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: "ReviewFlow Core Platform",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  };

  return ApiResponse.success(healthData);
}

