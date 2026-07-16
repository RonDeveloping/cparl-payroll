// lib/validations/tenant-schema.ts
import { z } from "zod";
import { isValidCanadianPostalCode } from "@/utils/validators/postalCode";
import { CANADA_PROVINCE_TERRITORY_CODES } from "@/constants/canada-provinces";

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

function normalizeMonthEndDayInput(val: unknown): number | null {
  if (val === "" || val == null) return null;
  const numericValue = Number(val);
  if (Number.isNaN(numericValue)) return numericValue;
  if (numericValue === 29) return -3;
  if (numericValue === 30) return -2;
  if (numericValue === 31) return -1;
  return numericValue;
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
  contactFirstName: z.string().optional().nullable(),
  contactLastName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z
    .object({
      street: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      province: z
        .preprocess(
          (val) => {
            if (typeof val !== "string") return val;
            const normalized = val.trim().toUpperCase();
            return normalized === "" ? null : normalized;
          },
          z
            .string()
            .refine(
              (val) => CANADA_PROVINCE_TERRITORY_CODES.includes(val as never),
              {
                message: "Select a valid Canadian province or territory",
              },
            )
            .nullable()
            .optional(),
        )
        .optional()
        .nullable(),
      postalCode: z
        .string()
        .transform((val) => val.trim().toUpperCase())
        .refine((val) => val === "" || isValidCanadianPostalCode(val), {
          message: "Enter a valid Canadian postal code (e.g., K1A 0B1)",
        })
        .optional()
        .nullable(),
      country: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  // slug is auto-generated from coreName and legalNameEnding, not user input

  // Payroll unit setup
  payrollUnitName: z.string().trim().optional().nullable(),
  payScheduleCode: z.string().trim().optional().nullable(),
  payFrequency: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .enum(["WEEKLY", "BIWEEKLY", "SEMIMONTHLY", "MONTHLY"])
      .nullable()
      .optional(),
  ),
  timingDays: z.coerce.number().int().optional().nullable(),
  periodEndDay: z.preprocess(
    (val) => normalizeMonthEndDayInput(val),
    z.number().int().min(-3).max(28).nullable().optional(),
  ),
  periodEndWeekday: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ])
      .nullable()
      .optional(),
  ),
  boundaryShift: z.preprocess(
    (val) => (val === "" || val == null ? null : Number(val)),
    z.number().int().min(-50).max(2).nullable().optional(),
  ),
  payWeekday: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ])
      .nullable()
      .optional(),
  ),
  payday: z.preprocess(
    (val) => normalizeMonthEndDayInput(val),
    z.number().int().min(-3).max(28).nullable().optional(),
  ),
  payday2: z.preprocess(
    (val) => normalizeMonthEndDayInput(val),
    z.number().int().min(-3).max(28).nullable().optional(),
  ),
  periodEndDay2: z.preprocess(
    (val) => normalizeMonthEndDayInput(val),
    z.number().int().min(-3).max(28).nullable().optional(),
  ),
  boundaryShift2: z.preprocess(
    (val) => (val === "" || val == null ? null : Number(val)),
    z.number().int().min(-50).max(2).nullable().optional(),
  ),
  fundingMethod: z.preprocess(
    (val) => (val === "" ? null : val),
    z.enum(["PAP", "WIRE", "MANUAL"]).nullable().optional(),
  ),
  fundingLeadDays: z.coerce.number().int().min(0).max(30).optional().nullable(),
  glExpenseAccountCode: z.string().trim().optional().nullable(),
  glLiabilityAccountCode: z.string().trim().optional().nullable(),
  glClearingAccountCode: z.string().trim().optional().nullable(),
});

export type TenantFormInput = z.infer<typeof tenantSchema>;
