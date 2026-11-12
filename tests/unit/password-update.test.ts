import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import { PATCH } from "@/app/api/admin/profile/password/route";
import { UpdatePasswordSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";
import { vi } from "vitest";

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

describe.sequential("Admin Password Update Suite", () => {
  const testEmail = "pw-test-admin@reviewflow.io";
  const initialPassword = "InitialPassword123!";
  const newPassword = "BrandNewSecurePassword456!";
  let testUserId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const user = await prisma.user.upsert({
      where: { email: testEmail },
      update: { passwordHash, isActive: true },
      create: {
        email: testEmail,
        passwordHash,
        fullName: "Password Test Admin",
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });
    testUserId = user.id;
  });

  it("validates schema requirements strictly", () => {
    // Missing fields
    expect(() => UpdatePasswordSchema.parse({})).toThrow();

    // Passwords mismatch
    expect(() =>
      UpdatePasswordSchema.parse({
        currentPassword: initialPassword,
        newPassword: "SomeNewPassword1!",
        confirmPassword: "DifferentPassword2!",
      })
    ).toThrow(/do not match/);

    // Password too short (< 8 chars)
    expect(() =>
      UpdatePasswordSchema.parse({
        currentPassword: initialPassword,
        newPassword: "short",
        confirmPassword: "short",
      })
    ).toThrow(/at least 8 characters/);

    // Current matches new
    expect(() =>
      UpdatePasswordSchema.parse({
        currentPassword: initialPassword,
        newPassword: initialPassword,
        confirmPassword: initialPassword,
      })
    ).toThrow(/different from current password/);
  });

  it("rejects unauthenticated request with 401", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/admin/profile/password", {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword: initialPassword,
        newPassword: newPassword,
        confirmPassword: newPassword,
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("rejects password update when current password is wrong", async () => {
    vi.mocked(getToken).mockResolvedValueOnce({
      id: testUserId,
      email: testEmail,
      role: "SUPER_ADMIN",
    });

    const req = new NextRequest("http://localhost:3000/api/admin/profile/password", {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword: "WrongCurrentPassword999!",
        newPassword: newPassword,
        confirmPassword: newPassword,
      }),
    });

    const res = await PATCH(req);
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.error.message).toMatch(/Current password is incorrect/);
  });

  it("successfully updates password and verifies new hash in database", async () => {
    vi.mocked(getToken).mockResolvedValueOnce({
      id: testUserId,
      email: testEmail,
      role: "SUPER_ADMIN",
    });

    const req = new NextRequest("http://localhost:3000/api/admin/profile/password", {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword: initialPassword,
        newPassword: newPassword,
        confirmPassword: newPassword,
      }),
    });

    const res = await PATCH(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);

    // Verify hash changed and matches new password
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUserId },
    });
    expect(updatedUser).toBeDefined();
    const isNewValid = await bcrypt.compare(newPassword, updatedUser!.passwordHash);
    expect(isNewValid).toBe(true);
    const isOldValid = await bcrypt.compare(initialPassword, updatedUser!.passwordHash);
    expect(isOldValid).toBe(false);
  });
});
