import { describe, it, expect } from "vitest";
import { QRGeneratorService } from "@/services/qr/qr-generator.service";
import { PDFGeneratorService } from "@/services/qr/pdf-generator.service";

describe("QR & Table Tent Suite", () => {
  it("generates valid SVG with custom colors", async () => {
    const svg = await QRGeneratorService.generateSvg({
      url: "https://example.com/r/test-business",
      foregroundColor: "#1d4ed8",
      backgroundColor: "#ffffff",
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("#1d4ed8");
  });

  it("generates valid high-resolution PNG data URL", async () => {
    const dataUrl = await QRGeneratorService.generateDataUrl({
      url: "https://example.com/r/test-business",
      width: 512,
    });

    expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);
    expect(dataUrl.length).toBeGreaterThan(100);
  });

  it("generates print-ready table tent HTML document", async () => {
    const html = await PDFGeneratorService.generateTableTentHtml({
      businessName: "Apex Dental",
      category: "Cosmetic Dentistry",
      landingUrl: "https://reviewflow.io/r/apex-dental",
      foregroundColor: "#0f172a",
      backgroundColor: "#ffffff",
    });

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Apex Dental");
    expect(html).toContain("Cosmetic Dentistry");
    expect(html).toContain("<svg");
    expect(html).toContain("Fold along dashed boundary");
  });
});
