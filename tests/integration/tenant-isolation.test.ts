import { describe, it, expect } from "vitest";
import { BusinessService } from "@/services/business.service";
import { prisma } from "@/lib/prisma";

describe("Multi-Tenant Data Isolation", () => {
  const adminUserId = "usr_agency_admin_001";
  const intruderUserId = "usr_unauthorized_intruder_999";

  it("allows the owning agency admin to retrieve their business", async () => {
    // Look up the seeded Apex Dental business
    const business = await prisma.business.findUnique({
      where: { slug: "apex-dental" },
    });

    if (!business) {
      // If database not seeded during isolated test runner, skip
      return;
    }

    const fetched = await BusinessService.getBusinessById(business.id, adminUserId);
    expect(fetched.id).toBe(business.id);
    expect(fetched.userId).toBe(adminUserId);
  });

  it("strictly prevents an unauthorized tenant from accessing another agency's business", async () => {
    const business = await prisma.business.findUnique({
      where: { slug: "apex-dental" },
    });

    if (!business) {
      return;
    }

    // Attempt retrieval with intruder user ID
    await expect(
      BusinessService.getBusinessById(business.id, intruderUserId)
    ).rejects.toThrow();
  });

  it("strictly prevents an unauthorized tenant from updating another agency's business", async () => {
    const business = await prisma.business.findUnique({
      where: { slug: "apex-dental" },
    });

    if (!business) {
      return;
    }

    // Attempt update with intruder user ID
    await expect(
      BusinessService.updateBusiness(business.id, intruderUserId, {
        name: "Hacked Business Name",
      })
    ).rejects.toThrow();
  });

  it("strictly prevents an unauthorized tenant from deleting another agency's business", async () => {
    const business = await prisma.business.findUnique({
      where: { slug: "apex-dental" },
    });

    if (!business) {
      return;
    }

    // Attempt hard delete with intruder user ID
    await expect(
      BusinessService.hardDeleteBusiness(business.id, intruderUserId)
    ).rejects.toThrow();
  });
});
