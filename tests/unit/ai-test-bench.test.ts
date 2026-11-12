import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/admin/settings/test-ai/route";
import { getToken } from "next-auth/jwt";
import { vi } from "vitest";

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

describe("Admin AI Test Bench Suite", () => {
  const mockAdmin = {
    id: "usr_admin_test_001",
    email: "admin@reviewflow.io",
    role: "SUPER_ADMIN",
  };

  it("rejects unauthenticated requests with 401", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/admin/settings/test-ai", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("executes generation test and returns latency, provider and sample text", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(mockAdmin);

    const req = new NextRequest("http://localhost:3000/api/admin/settings/test-ai", {
      method: "POST",
      body: JSON.stringify({
        businessName: "Elite Auto Care",
        category: "Automotive Repair",
        services: ["Brake Inspection", "Oil Change", "Engine Diagnostics"],
        targetService: "Brake Inspection",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("providerUsed");
    expect(body.data).toHaveProperty("latencyMs");
    expect(typeof body.data.latencyMs).toBe("number");
    expect(body.data).toHaveProperty("sampleReviewText");
    expect(body.data.sampleReviewText.length).toBeGreaterThan(10);
    expect(body.data.sampleReviewText).toContain("Elite Auto Care");
  });
});

