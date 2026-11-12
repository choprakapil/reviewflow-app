import { NextResponse } from "next/server";
import { generateRequestId } from "./utils";
import { ZodError } from "zod";
import { AppError } from "./exceptions";

export interface ApiSuccessPayload<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface ApiErrorPayload {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown;
    requestId: string;
  };
}

export class ApiResponse {
  static success<T>(data: T, status = 200, requestId?: string): NextResponse<ApiSuccessPayload<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: requestId || generateRequestId(),
        },
      },
      { status }
    );
  }

  static error(
    message: string,
    code = "INTERNAL_ERROR",
    status = 500,
    details: unknown = null,
    requestId?: string
  ): NextResponse<ApiErrorPayload> {
    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
          details,
          requestId: requestId || generateRequestId(),
        },
      },
      { status }
    );
  }

  static handle(error: unknown, req?: Request): NextResponse<ApiErrorPayload> {
    const requestId = req?.headers.get("x-request-id") || generateRequestId();

    if (error instanceof ZodError) {
      return this.error(
        "Validation failed",
        "VALIDATION_FAILED",
        422,
        error.flatten().fieldErrors,
        requestId
      );
    }

    if (error instanceof AppError) {
      return this.error(error.message, error.code, error.statusCode, error.details ?? null, requestId);
    }

    console.error(`[Unhandled API Error] (ReqID: ${requestId}):`, error);
    return this.error("An unexpected internal error occurred", "INTERNAL_ERROR", 500, null, requestId);
  }
}

