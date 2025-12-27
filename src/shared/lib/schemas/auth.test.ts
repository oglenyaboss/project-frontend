import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "./auth";

describe("Auth Schemas", () => {
  describe("loginSchema", () => {
    it("should validate correct data", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = loginSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          "Введите корректный email",
        );
      }
    });

    it("should reject empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("should validate correct data", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        display_name: "TestUser",
      });
      expect(result.success).toBe(true);
    });

    it("should reject short password", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "short",
        display_name: "TestUser",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("минимум 8 символов");
      }
    });

    it("should reject short display name", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        display_name: "Bob",
      });
      expect(result.success).toBe(false);
    });
  });
});
