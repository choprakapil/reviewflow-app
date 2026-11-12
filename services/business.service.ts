import { prisma } from "@/lib/prisma";
import { CreateBusinessInput, UpdateBusinessInput } from "@/lib/validations/business";
import { ConflictError, NotFoundError, ForbiddenError } from "@/lib/exceptions";
import { BusinessStatus, Prisma } from "@prisma/client";

/**
 * Normalizes a raw string into a clean, URL-safe alphanumeric slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export class BusinessService {
  /**
   * Generates a unique slug, appending incrementing numbers if collision occurs.
   */
  static async generateUniqueSlug(baseName: string): Promise<string> {
    const baseSlug = slugify(baseName) || "business";
    let candidateSlug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.business.findUnique({
        where: { slug: candidateSlug },
        select: { id: true },
      });

      if (!existing) {
        return candidateSlug;
      }

      counter++;
      candidateSlug = `${baseSlug}-${counter}`;
    }
  }

  /**
   * Creates a business, initializing default AI configuration and permanent QR record.
   */
  static async createBusiness(userId: string, input: CreateBusinessInput) {
    const slug = await this.generateUniqueSlug(input.name);

    return await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          userId,
          name: input.name,
          slug,
          category: input.category,
          description: input.description,
          address: input.address,
          website: input.website || null,
          phone: input.phone,
          googleReviewUrl: input.googleReviewUrl,
          googlePlaceId: input.googlePlaceId || null,
          keywords: input.keywords,
          services: input.services,
          factualHighlights: input.factualHighlights,
          defaultLanguage: input.defaultLanguage,
          supportedLanguages: input.supportedLanguages,
          status: BusinessStatus.ACTIVE,
          aiConfig: {
            create: {
              preferredProvider: "GEMINI",
              modelName: "gemini-2.0-flash",
              reviewLength: "MEDIUM",
              writingStyle: "NATURAL",
              temperature: 0.7,
              autoReplenishPool: true,
              poolTargetSize: 10,
            },
          },
          qrCode: {
            create: {
              permanentShortUrl: `/r/${slug}`,
              errorCorrectionLevel: "M",
              foregroundColor: "#000000",
              backgroundColor: "#FFFFFF",
              isActive: true,
            },
          },
        },
        include: {
          aiConfig: true,
          qrCode: true,
        },
      });

      return business;
    });
  }

  /**
   * Retrieves list of businesses for the authenticated user with optional status filter.
   */
  static async getBusinesses(userId: string, status?: BusinessStatus, search?: string) {
    const where: Prisma.BusinessWhereInput = {
      userId,
      ...(status ? { status } : { status: { not: BusinessStatus.ARCHIVED } }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { category: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    return await prisma.business.findMany({
      where,
      include: {
        aiConfig: true,
        qrCode: true,
        _count: {
          select: {
            suggestions: true,
            analytics: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Retrieves full details for a business by ID, enforcing tenant ownership.
   */
  static async getBusinessById(id: string, userId: string) {
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        aiConfig: true,
        qrCode: true,
        suggestions: {
          where: { isArchived: false },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!business) {
      throw new NotFoundError("Business not found");
    }

    if (business.userId !== userId) {
      throw new ForbiddenError("You do not have permission to access this business profile");
    }

    return business;
  }

  /**
   * Public lookup for customer QR landing page by slug.
   */
  static async getBusinessBySlug(slug: string) {
    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        qrCode: true,
        suggestions: {
          where: { isArchived: false },
          orderBy: { timesServed: "asc" },
          take: 5,
        },
      },
    });

    if (!business) {
      throw new NotFoundError("Business review portal not found");
    }

    return business;
  }

  /**
   * Updates business attributes with tenant scoping.
   */
  static async updateBusiness(id: string, userId: string, input: UpdateBusinessInput) {
    // Verify ownership
    await this.getBusinessById(id, userId);

    return await prisma.business.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.category ? { category: input.category } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.website !== undefined ? { website: input.website || null } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.googleReviewUrl ? { googleReviewUrl: input.googleReviewUrl } : {}),
        ...(input.googlePlaceId !== undefined ? { googlePlaceId: input.googlePlaceId } : {}),
        ...(input.keywords ? { keywords: input.keywords } : {}),
        ...(input.services ? { services: input.services } : {}),
        ...(input.factualHighlights ? { factualHighlights: input.factualHighlights } : {}),
      },
      include: {
        aiConfig: true,
        qrCode: true,
      },
    });
  }

  /**
   * Soft-deletes a business (Archive).
   */
  static async archiveBusiness(id: string, userId: string) {
    await this.getBusinessById(id, userId);

    return await prisma.business.update({
      where: { id },
      data: {
        status: BusinessStatus.ARCHIVED,
        archivedAt: new Date(),
      },
    });
  }

  /**
   * Restores an archived business to active status.
   */
  static async restoreBusiness(id: string, userId: string) {
    const business = await this.getBusinessById(id, userId);

    return await prisma.business.update({
      where: { id },
      data: {
        status: BusinessStatus.ACTIVE,
        archivedAt: null,
      },
    });
  }

  /**
   * Permanently deletes a business record and cascades associated records.
   */
  static async hardDeleteBusiness(id: string, userId: string) {
    await this.getBusinessById(id, userId);

    return await prisma.business.delete({
      where: { id },
    });
  }
}

