// lib/validations/tenant-schema.ts
import { z } from "zod";
import { isValidCanadianPostalCode } from "@/utils/validators/postalCode";

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
  contactFirstName: z.string().optional().nullable(),
  contactLastName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z
    .object({
      street: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      province: z.string().optional().nullable(),
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
  periodBoundaryType: z.preprocess(
    (val) => (val === "" ? null : val),
    z.enum(["CALENDAR", "ANCHORED"]).nullable().optional(),
  ),
  firstBoundaryAnchorDay: z.preprocess(
    (val) => (val === "" || val == null ? null : Number(val)),
    z.number().int().min(1).max(31).nullable().optional(),
  ),
  firstBoundaryAnchorWeekday: z.preprocess(
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
  firstPaydayOffsetDays: z.preprocess(
    (val) => (val === "" || val == null ? null : Number(val)),
    z.number().int().min(-31).max(31).nullable().optional(),
  ),
  firstPaydayWeekday: z.preprocess(
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
  monthlyPaydayDay: z.preprocess(
    (val) => (val === "" || val == null ? null : Number(val)),
    z.number().int().min(1).max(31).nullable().optional(),
  ),
  calendarPeriodEndDay: z.preprocess(
    (val) => (val === "" || val == null ? null : Number(val)),
    z.number().int().min(1).max(31).nullable().optional(),
  ),
  secondBoundaryAnchorDay: z.preprocess(
    (val) => (val === "" || val == null ? null : Number(val)),
    z.number().int().min(1).max(31).nullable().optional(),
  ),
  secondPaydayOffsetDays: z.preprocess(
    (val) => (val === "" || val == null ? null : Number(val)),
    z.number().int().min(-31).max(31).nullable().optional(),
  ),
  secondPaydayWeekday: z.preprocess(
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
