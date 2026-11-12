import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/admin/upload-logo/route";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { vi } from "vitest";

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

describe.sequential("File Upload Hardening & Logo Security Suite", () => {
  const tenantA = {
    id: "usr_tenant_a_logo",
    email: "tenantA_logo@reviewflow.io",
    role: "AGENCY_ADMIN",
  };

  const tenantB = {
    id: "usr_tenant_b_logo",
    email: "tenantB_logo@reviewflow.io",
    role: "AGENCY_ADMIN",
  };

  let businessAId: string;

  beforeAll(async () => {
    await prisma.user.upsert({
      where: { email: tenantA.email },
      update: { isActive: true },
      create: {
        id: tenantA.id,
        email: tenantA.email,
        passwordHash: "hashA",
        fullName: "Tenant A",
        role: "AGENCY_ADMIN",
        isActive: true,
      },
    });

    await prisma.user.upsert({
      where: { email: tenantB.email },
      update: { isActive: true },
      create: {
        id: tenantB.id,
        email: tenantB.email,
        passwordHash: "hashB",
        fullName: "Tenant B",
        role: "AGENCY_ADMIN",
        isActive: true,
      },
    });

    const bus = await prisma.business.create({
      data: {
        userId: tenantA.id,
        name: "Tenant A Business for Logo",
        slug: "tenant-a-logo-bus",
        category: "Retail",
        googleReviewUrl: "https://g.page/r/test-a/review",
      },
    });
    businessAId = bus.id;
  });

  afterAll(async () => {
    await prisma.business.deleteMany({ where: { id: businessAId } });
    await prisma.user.deleteMany({
      where: { id: { in: [tenantA.id, tenantB.id] } },
    });
  });

  it("strictly rejects SVG uploads to eliminate 100% of XML/SVG script vectors", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(tenantA);

    const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`;
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([maliciousSvg], { type: "image/svg+xml" }),
      "exploit.svg"
    );

    const req = new NextRequest("http://localhost:3000/api/admin/upload-logo", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.error.message).toMatch(/SVG upload is prohibited for security compliance/);
  });

  it("rejects unauthenticated upload requests with 401", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(null);

    const formData = new FormData();
    formData.append("file", new Blob(["dummy"], { type: "image/png" }), "logo.png");

    const req = new NextRequest("http://localhost:3000/api/admin/upload-logo", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("rejects files exceeding the 2MB size limit", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(tenantA);

    const largeBuffer = new Uint8Array(2.5 * 1024 * 1024);
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([largeBuffer], { type: "image/png" }),
      "large-logo.png"
    );

    const req = new NextRequest("http://localhost:3000/api/admin/upload-logo", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.error.message).toMatch(/exceeds maximum allowed limit of 2MB/);
  });

  it("rejects files with spoofed magic bytes", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(tenantA);

    const fakePng = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([fakePng], { type: "image/png" }),
      "fake.png"
    );

    const req = new NextRequest("http://localhost:3000/api/admin/upload-logo", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.error.message).toMatch(/File content header does not match declared MIME type/);
  });

  it("strictly prevents cross-tenant logo updates", async () => {
    // Tenant B attempts to upload/attach logo to Tenant A's business
    vi.mocked(getToken).mockResolvedValueOnce(tenantB);

    const validPng = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([validPng], { type: "image/png" }),
      "valid.png"
    );
    formData.append("businessId", businessAId);

    const req = new NextRequest("http://localhost:3000/api/admin/upload-logo", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();
    // Ownership guard rejects with 403 Forbidden
    expect(res.status).toBe(403);
    expect(body.error.message).toMatch(/Unauthorized access to business owned by another tenant/);
  });

  it("accepts and stores valid PNG file for authorized tenant", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(tenantA);

    const validPng = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([validPng], { type: "image/png" }),
      "test-valid.png"
    );
    formData.append("businessId", businessAId);

    const req = new NextRequest("http://localhost:3000/api/admin/upload-logo", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.url).toMatch(/^\/uploads\//);
    expect(body.data.mimeType).toBe("image/png");

    // Verify logoUrl updated on business
    const updated = await prisma.business.findUnique({
      where: { id: businessAId },
    });
    expect(updated?.logoUrl).toBe(body.data.url);
  });
});
