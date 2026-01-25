import { describe, it, expect } from "vitest";
import { isValidCanadianPostalCode } from "./postalCode";

describe("Canadian postal code validation", () => {
  it("accepts valid Canadian postal codes", () => {
    const valid = [
      "K1A 0B1",
      "k1a0b1",
      "H0H 0H0", // Santa Claus postal code
      "V6B 1A1",
    ];

    valid.forEach((code) => {
      expect(isValidCanadianPostalCode(code)).toBe(true);
    });
  });

  it("rejects invalid formats", () => {
    const invalid = [
      "123 456",
      "AAA AAA",
      "K1A-0B1",
      "K1A_0B1",
      "K1A0B", // too short
      "K1A0B12", // too long
    ];

    invalid.forEach((code) => {
      expect(isValidCanadianPostalCode(code)).toBe(false);
    });
  });

  it("rejects forbidden letters", () => {
    const invalid = [
      "D1A 0B1", // D forbidden in first
      "K1I 0B1", // I forbidden in third
      "K1O 0B1", // O forbidden in third
      "K1Q 0B1", // Q forbidden in third
      "K1U 0B1", // U forbidden in third
    ];

    invalid.forEach((code) => {
      expect(isValidCanadianPostalCode(code)).toBe(false);
    });
  });

  it("rejects empty or whitespace-only strings", () => {
    expect(isValidCanadianPostalCode("")).toBe(false);
    expect(isValidCanadianPostalCode("   ")).toBe(false);
  });
});
