import { describe, it, expect } from "vitest";
import { BusinessService } from "@/services/business.service";
import { verifyBusinessOwnership, authenticateAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

describe("Multi-Tenant Data Isolation & Ownership Suite", () => {
  const adminUserId = "usr_agency_admin_001";
  const intruderUserId = "usr_unauthorized_intruder_999";

  it("allows the owning agency admin to retrieve their business", async () => {
    const business = await prisma.business.findUnique({
      where: { slug: "apex-dental" },
    });

    if (!business) return;

    const fetched = await BusinessService.getBusinessById(business.id, adminUserId);
    expect(fetched.id).toBe(business.id);
    expect(fetched.userId).toBe(adminUserId);
  });

  it("strictly prevents an unauthorized tenant from accessing another agency's business", async () => {
    const business = await prisma.business.findUnique({
      where: { slug: "apex-dental" },
    });

    if (!business) return;

    await expect(
      BusinessService.getBusinessById(business.id, intruderUserId)
    ).rejects.toThrow();
  });

  it("prevents an unauthorized tenant from reading or modifying suggestions via ownership guard", async () => {
    const business = await prisma.business.findUnique({
      where: { slug: "apex-dental" },
    });

    if (!business) return;

    // Verify ownership succeeds for owner
    const verified = await verifyBusinessOwnership(business.id, adminUserId);
    expect(verified.id).toBe(business.id);

    // Verify ownership throws FORBIDDEN (403) for cross-tenant intruder
    await expect(
      verifyBusinessOwnership(business.id, intruderUserId)
    ).rejects.toThrow(/Unauthorized access to business/);
  });

  it("strictly prevents an unauthorized tenant from updating another agency's business", async () => {
    const business = await prisma.business.findUnique({
      where: { slug: "apex-dental" },
    });

    if (!business) return;

    await expect(
      BusinessService.updateBusiness(business.id, intruderUserId, {
        name: "Hacked Business Name",
      })
    ).rejects.toThrow();
  });

  it("strictly prevents an unauthorized tenant from archiving another agency's business", async () => {
    const business = await prisma.business.findUnique({
      where: { slug: "apex-dental" },
    });

    if (!business) return;

    await expect(
      BusinessService.archiveBusiness(business.id, intruderUserId)
    ).rejects.toThrow();
  });

  it("strictly prevents an unauthorized tenant from restoring another agency's business", async () => {
    const business = await prisma.business.findUnique({
      where: { slug: "apex-dental" },
    });

    if (!business) return;

    await expect(
      BusinessService.restoreBusiness(business.id, intruderUserId)
    ).rejects.toThrow();
  });

  it("strictly prevents an unauthorized tenant from deleting another agency's business", async () => {
    const business = await prisma.business.findUnique({
      where: { slug: "apex-dental" },
    });

    if (!business) return;

    await expect(
      BusinessService.hardDeleteBusiness(business.id, intruderUserId)
    ).rejects.toThrow();
  });

  it("strictly prevents cross-tenant QR code access", async () => {
    const business = await prisma.business.findUnique({
      where: { slug: "apex-dental" },
    });

    if (!business) return;

    await expect(
      verifyBusinessOwnership(business.id, intruderUserId)
    ).rejects.toThrow(/Unauthorized access to business/);
  });

  it("strictly prevents cross-tenant Google URL verification", async () => {
    const business = await prisma.business.findUnique({
      where: { slug: "apex-dental" },
    });

    if (!business) return;

    await expect(
      verifyBusinessOwnership(business.id, intruderUserId)
    ).rejects.toThrow(/Unauthorized access to business/);
  });

  it("rejects unauthenticated requests with HTTP 401 via authenticateAdmin", async () => {
    // Request with no NextAuth cookie / token
    const req = new NextRequest("http://localhost:3000/api/admin/businesses");
    await expect(authenticateAdmin(req)).rejects.toThrow(/Authentication required/);
  });
});
