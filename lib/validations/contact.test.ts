import { describe, it, expect } from "vitest";
import { contactSchema } from "./contact-schema";

describe("contactSchema postalCode", () => {
  it("accepts valid Canadian postal code", () => {
    const result = contactSchema.safeParse({
      givenName: "John",
      familyName: "Doe",
      city: "Ottawa",
      province: "ON",
      country: "Canada",
      email: "john@example.com",
      postalCode: "K1A 0B1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid postal code", () => {
    const result = contactSchema.safeParse({
      givenName: "John",
      familyName: "Doe",
      city: "Ottawa",
      province: "ON",
      country: "Canada",
      email: "john@example.com",
      postalCode: "123 456",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Enter a valid Canadian postal code (e.g., K1A 0B1)",
      );
    }
  });

  it("trims whitespace before validation", () => {
    const result = contactSchema.safeParse({
      givenName: "John",
      familyName: "Doe",
      city: "Ottawa",
      province: "ON",
      country: "Canada",
      email: "john@example.com",
      postalCode: " K1A 0B1 ",
    });
    expect(result.success).toBe(true);
  });
});
