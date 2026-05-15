// lib/validations/contact-schema.ts
import { z } from "zod";
import { isValidCanadianPostalCode } from "../../utils/validators/postalCode";
import { isValidSINLuhn } from "../../utils/formatters/sin";

function isValidDobRange(value: string) {
  const normalized = value.trim();
  const digits = normalized.replace(/\D/g, "");

  // Do not show validation error while typing the first 3 year digits.
  if (digits.length < 4) {
    return true;
  }

  const now = new Date();
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const minUtc = new Date(todayUtc);
  minUtc.setUTCFullYear(todayUtc.getUTCFullYear() - 150);

  const year = Number(digits.slice(0, 4));
  if (Number.isNaN(year)) {
    return false;
  }

  // Start validation once YYYY is complete.
  if (year < minUtc.getUTCFullYear() || year > todayUtc.getUTCFullYear()) {
    return false;
  }

  // Validate month as soon as MM is complete.
  if (digits.length >= 6) {
    const month = Number(digits.slice(4, 6));
    if (Number.isNaN(month) || month < 1 || month > 12) {
      return false;
    }
  }

  // Validate day as soon as DD is complete.
  if (digits.length >= 8) {
    const month = Number(digits.slice(4, 6));
    const day = Number(digits.slice(6, 8));
    if (Number.isNaN(day) || day < 1) {
      return false;
    }
    const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (day > maxDay) {
      return false;
    }
  }

  // While month/day is still being entered, keep remaining checks neutral.
  if (digits.length < 8) {
    return true;
  }

  if (digits.length > 8) {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return false;
  }

  const [yearPart, monthPart, dayPart] = normalized.split("-");
  const fullYear = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  const date = new Date(Date.UTC(fullYear, month - 1, day));
  if (
    date.getUTCFullYear() !== fullYear ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return false;
  }

  return date >= minUtc && date <= todayUtc;
}

export const contactSchema = z.object({
  givenName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .refine((val) => !/\d/.test(val), {
      message: "First name cannot contain numbers",
    }),
  middleName: z.string().optional(),
  familyName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .refine((val) => !/\d/.test(val), {
      message: "Last name cannot contain numbers",
    }),
  nickName: z.string().optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  displayName: z.string().optional(),
  sin: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const digits = val.replace(/\D/g, "");
        if (digits.length < 9) return true;
        if (digits.length > 9) return false;
        return isValidSINLuhn(val);
      },
      { message: "Invalid SIN (must be 9 digits and pass validation)" },
    ),
  dob: z
    .string()
    .optional()
    .refine((val) => !val || isValidDobRange(val), {
      message: "Date of birth must be a valid date within the last 150 years",
    }),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const digits = val.replace(/\D/g, "");
        return digits.length == 10;
      },
      { message: "Phone number must contain 10 digits" },
    ),
  street: z.string().optional(),
  city: z.string().optional(), //min(1, "City is required"),
  province: z.string().optional(),
  country: z.string().optional(),
  postalCode: z
    .string()
    // .nonempty("Postal code cannot be empty")
    .transform((val) => val.trim().toUpperCase()) //trim whitespace
    .refine(isValidCanadianPostalCode, {
      message: "Enter a valid Canadian postal code (e.g., K1A 0B1)",
    })
    .optional(),
});

// Export the type so both frontend and backend can use it
export type ContactFormInput = z.infer<typeof contactSchema>;
