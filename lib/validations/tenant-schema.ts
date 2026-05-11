import { z } from "zod";

/**
 * CRA Business Number check digit validation using the Luhn algorithm.
 * The 9-digit base BN must satisfy: sum of all digits (with every second digit
 * from the right doubled, and if >9 subtract 9) is divisible by 10.
 */
function isValidCRABusinessNumber(nineDigits: string): boolean {
  if (!/^\d{9}$/.test(nineDigits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(nineDigits[i], 10);
    // Double every second digit from the right (positions 8, 6, 4, 2, 0 from left = even indices)
    if ((8 - i) % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export const tenantSchema = z.object({
  coreName: z.string().min(1, "Legal name is required"),
  operatingName: z.string().optional().nullable(),
  legalNameEnding: z
    .enum(["Inc.", "Corp.", "Ltd", "Limited", "Incorporated", "Corporation"])
    .optional()
    .nullable(),
  businessNumber: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true; // optional
        return /^\d{3}-\d{3}-\d{3} RP \d{4}$/.test(val.trim());
      },
      { message: "Business number must be in the format 999-999-999 RP 0001" },
    )
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true; // optional
        const nineDigits = val.replace(/\D/g, "").slice(0, 9);
        return isValidCRABusinessNumber(nineDigits);
      },
      { message: "Invalid CRA business number — check digit does not match" },
    ),
  isActive: z.boolean(),
  memberEmails: z.string().optional(),
  // Contact information fields
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z
    .object({
      street: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      province: z.string().optional().nullable(),
      postalCode: z.string().optional().nullable(),
      country: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  // slug is auto-generated from coreName and legalNameEnding, not user input
});

export type TenantFormInput = z.infer<typeof tenantSchema>;
