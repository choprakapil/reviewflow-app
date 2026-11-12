import { describe, it, expect } from "vitest";
import { LoginSchema } from "@/lib/validations/auth";

describe("Login validation schema", () => {
  it("accepts valid email and password", () => {
    const valid = { email: "admin@agency.com", password: "Password123!" };
    const result = LoginSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email formats", () => {
    const invalid = { email: "not-an-email", password: "Password123!" };
    const result = LoginSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects passwords shorter than 6 characters", () => {
    const shortPass = { email: "admin@agency.com", password: "123" };
    const result = LoginSchema.safeParse(shortPass);
    expect(result.success).toBe(false);
  });
});

