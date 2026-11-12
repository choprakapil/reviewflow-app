import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/admin/upload-logo/route";
import { sanitizeSvg } from "@/lib/utils/file-upload";
import { getToken } from "next-auth/jwt";
import { vi } from "vitest";

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

describe("File Upload Hardening & Logo Security Suite", () => {
  const mockAdminSession = {
    id: "usr_admin_test_001",
    email: "admin@reviewflow.io",
    role: "SUPER_ADMIN",
  };

  it("sanitizes SVG content by stripping scripts, inline events, and javascript links", () => {
    const maliciousSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" onload="alert('XSS')">
        <script>alert(document.cookie);</script>
        <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" onclick="stealData()" />
        <a href="javascript:doEvil()"><text x="10" y="20">Click me</text></a>
      </svg>
    `;

    const cleaned = sanitizeSvg(maliciousSvg);

    expect(cleaned).not.toContain("<script>");
    expect(cleaned).not.toContain("alert(document.cookie)");
    expect(cleaned).not.toContain("onload=");
    expect(cleaned).not.toContain("onclick=");
    expect(cleaned).not.toContain("javascript:");
    expect(cleaned).toContain("<svg");
    expect(cleaned).toContain("<circle");
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
    vi.mocked(getToken).mockResolvedValueOnce(mockAdminSession);

    // Create a 2.5MB buffer
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

  it("rejects unsupported MIME types (e.g. text/html, application/pdf)", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(mockAdminSession);

    const formData = new FormData();
    formData.append(
      "file",
      new Blob(["<h1>Not an image</h1>"], { type: "text/html" }),
      "index.html"
    );

    const req = new NextRequest("http://localhost:3000/api/admin/upload-logo", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.error.message).toMatch(/Unsupported file type/);
  });

  it("rejects files with spoofed magic bytes", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(mockAdminSession);

    // Declares image/png, but contains non-PNG bytes
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

  it("accepts and stores valid PNG file with proper magic bytes", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(mockAdminSession);

    // PNG magic bytes: 0x89, 0x50, 0x4e, 0x47
    const validPng = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([validPng], { type: "image/png" }),
      "test-valid.png"
    );

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
  });
});
