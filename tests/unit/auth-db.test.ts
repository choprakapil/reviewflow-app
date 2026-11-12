import { describe, it, expect, beforeAll } from "vitest";
import { getAuthSecret, authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

describe.sequential("Database-Backed Authentication Suite", () => {
  const credentialsProvider = authOptions.providers[0];
  const authorizeFn = ((credentialsProvider as unknown as { options: { authorize: (c: unknown) => Promise<unknown> } }).options).authorize;

  const validPassword = "SecureValidPass123!";
  const activeEmail = "active-auth-user@reviewflow.io";
  const inactiveEmail = "inactive-auth-user@reviewflow.io";
  let activeUserId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash(validPassword, 10);

    // Active user
    const activeUser = await prisma.user.upsert({
      where: { email: activeEmail },
      update: {
        passwordHash,
        isActive: true,
      },
      create: {
        email: activeEmail,
        passwordHash,
        fullName: "Active Test User",
        role: "AGENCY_ADMIN",
        isActive: true,
      },
    });
    activeUserId = activeUser.id;

    // Inactive user
    await prisma.user.upsert({
      where: { email: inactiveEmail },
      update: {
        passwordHash,
        isActive: false,
      },
      create: {
        email: inactiveEmail,
        passwordHash,
        fullName: "Inactive Test User",
        role: "AGENCY_ADMIN",
        isActive: false,
      },
    });
  });

  it("authenticates valid database user credentials", async () => {
    const user = await authorizeFn({
      email: activeEmail,
      password: validPassword,
    });

    expect(user).toBeDefined();
    expect((user as { id: string }).id).toBe(activeUserId);
    expect((user as { email: string }).email).toBe(activeEmail);
    expect((user as { role: string }).role).toBe("AGENCY_ADMIN");
  });

  it("rejects invalid password for existing database user", async () => {
    const result = await authorizeFn({
      email: activeEmail,
      password: "WrongPassword123!",
    });

    expect(result).toBeNull();
  });

  it("rejects unknown user not found in database", async () => {
    const result = await authorizeFn({
      email: "non-existent-user@reviewflow.io",
      password: validPassword,
    });

    expect(result).toBeNull();
  });

  it("rejects inactive database user", async () => {
    const result = await authorizeFn({
      email: inactiveEmail,
      password: validPassword,
    });

    expect(result).toBeNull();
  });

  it("strictly rejects hardcoded default passwords or bypass attempts", async () => {
    // Attempting former default password on an account with validPassword
    const result = await authorizeFn({
      email: activeEmail,
      password: "AdminPass123!",
    });

    expect(result).toBeNull();
  });

  it("enforces strict NEXTAUTH_SECRET validation in production", () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.NEXTAUTH_SECRET;

    try {
      (process.env as Record<string, string>).NODE_ENV = "production";

      // Missing secret in production
      delete process.env.NEXTAUTH_SECRET;
      expect(() => getAuthSecret()).toThrow(/CRITICAL SECURITY CONFIGURATION ERROR/);

      // Insecure default secret in production
      process.env.NEXTAUTH_SECRET = "dev-insecure-secret-for-local-testing-only-replace-in-production-12345";
      expect(() => getAuthSecret()).toThrow(/CRITICAL SECURITY CONFIGURATION ERROR/);

      // Short secret in production
      process.env.NEXTAUTH_SECRET = "too-short";
      expect(() => getAuthSecret()).toThrow(/CRITICAL SECURITY CONFIGURATION ERROR/);

      // Secure secret in production
      process.env.NEXTAUTH_SECRET = "a-very-secure-random-32-byte-hex-string-for-prod-testing";
      expect(getAuthSecret()).toBe("a-very-secure-random-32-byte-hex-string-for-prod-testing");
    } finally {
      (process.env as Record<string, string>).NODE_ENV = originalEnv as string;
      process.env.NEXTAUTH_SECRET = originalSecret;
    }
  });
});
