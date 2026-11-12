import { describe, it, expect } from "vitest";
import { ApiResponse } from "@/lib/api-response";
import { AppError, NotFoundError } from "@/lib/exceptions";
import { z } from "zod";

describe("ApiResponse utility", () => {
  it("formats successful responses with standard metadata", async () => {
    const res = ApiResponse.success({ name: "Apex Dental" }, 200, "req_123");
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.name).toBe("Apex Dental");
    expect(json.meta.requestId).toBe("req_123");
    expect(json.meta.timestamp).toBeDefined();
  });

  it("handles custom AppError with correct status and error code", async () => {
    const err = new NotFoundError("Business not found");
    const res = ApiResponse.handle(err);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("NOT_FOUND");
    expect(json.error.message).toBe("Business not found");
  });

  it("handles Zod validation errors cleanly", async () => {
    const schema = z.object({
      name: z.string().min(3),
    });

    try {
      schema.parse({ name: "ab" });
    } catch (zodErr) {
      const res = ApiResponse.handle(zodErr);
      const json = await res.json();

      expect(res.status).toBe(422);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("VALIDATION_FAILED");
      expect(json.error.details).toBeDefined();
    }
  });
});

