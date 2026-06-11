// lib/validations/contact-schema.ts
import { z } from "zod";
import { isValidCanadianPostalCode } from "../../utils/validators/postalCode";
import { isValidSINLuhn } from "../../utils/formatters/sin";

const bankAccountInputSchema = z.object({
  id: z.string().optional(),
  institutionNumber: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^\d{3}$/.test(val), {
      message: "Use 3 digits for institution number (e.g., 001)",
    }),
  bankDetails: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^\d{5}[-\s]?\d{5,17}$/.test(val), {
      message: "Use format 12345-1234567 (branch-account)",
    }),
  distributionType: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(["FIXED_AMOUNT", "PERCENTAGE", "REMAINDER"]).optional(),
  ),
  distributionValue: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^(\d+|\d{1,3}(,\d{3})+)(\.\d{1,2})?$/.test(val), {
      message: "Distribution value must be a valid amount or percentage",
    }),
});

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

export const contactSchema = z
  .object({
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
    employeeNumber: z.string().trim().optional(),
    employmentTitle: z.string().trim().optional(),
    employmentDepartment: z.string().trim().optional(),
    hireDate: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: "Hire date must be in YYYY-MM-DD format",
      }),
    employmentEndDate: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: "Employment end date must be in YYYY-MM-DD format",
      }),
    employmentProvinceCode: z
      .string()
      .trim()
      .toUpperCase()
      .optional()
      .refine((val) => !val || /^[A-Z]{2}$/.test(val), {
        message: "Employment province code must be 2 letters (e.g., ON)",
      }),
    terminationReason: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z
        .enum([
          "ROE_A_SHORTAGE_OF_WORK",
          "ROE_B_STRIKE_OR_LOCKOUT",
          "ROE_C_RETURN_TO_SCHOOL",
          "ROE_D_ILLNESS_OR_INJURY",
          "ROE_E_QUIT",
          "ROE_F_MATERNITY",
          "ROE_G_RETIREMENT",
          "ROE_H_WORK_SHARING",
          "ROE_J_APPRENTICE_TRAINING",
          "ROE_K_OTHER",
          "ROE_M_DISMISSAL",
          "ROE_N_LEAVE_OF_ABSENCE",
          "ROE_P_PARENTAL",
          "ROE_Z_COMPASSIONATE_CARE_OR_FAMILY_CAREGIVER",
        ])
        .optional(),
    ),
    jobPayType: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.enum(["HOURLY", "SALARY"]).optional(),
    ),
    jobStartDate: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: "Job start date must be in YYYY-MM-DD format",
      }),
    jobPayRate: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || /^\d+(\.\d{1,2})?$/.test(val), {
        message: "Pay rate must be a valid amount with up to 2 decimals",
      }),
    jobEndDate: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: "Job end date must be in YYYY-MM-DD format",
      }),
    status: z.enum(["ACTIVE", "TERMINATED", "ON_LEAVE"]).optional(),
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
    bankAccounts: z.array(bankAccountInputSchema).default([]),
  })
  .superRefine((val, ctx) => {
    if (val.employmentEndDate && !val.terminationReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["terminationReason"],
        message:
          "Termination reason is required when employment end date is set",
      });
    }

    if (val.terminationReason && !val.employmentEndDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["employmentEndDate"],
        message:
          "Employment end date is required when termination reason is set",
      });
    }

    if (
      (val.jobPayType && !val.jobPayRate) ||
      (val.jobPayRate && !val.jobPayType)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [val.jobPayType ? "jobPayRate" : "jobPayType"],
        message: "Pay type and pay rate must be provided together",
      });
    }

    if (val.bankAccounts.length > 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bankAccounts"],
        message: "At most 10 bank accounts are allowed",
      });
    }

    let remainderCount = 0;

    val.bankAccounts.forEach((account, index) => {
      const institutionNumber = account.institutionNumber?.trim() || "";
      const bankDetails = account.bankDetails?.trim() || "";
      const hasInstitutionNumber = institutionNumber.length > 0;
      const hasBankDetails = bankDetails.length > 0;

      if (hasInstitutionNumber && !/^\d{3}$/.test(institutionNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bankAccounts", index, "institutionNumber"],
          message: "Use 3 digits for institution number (e.g., 001)",
        });
      }

      if (hasBankDetails && !/^\d{5}[-\s]?\d{5,17}$/.test(bankDetails)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bankAccounts", index, "bankDetails"],
          message: "Use format 12345-1234567 (branch-account)",
        });
      }

      if (hasInstitutionNumber !== hasBankDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [
            "bankAccounts",
            index,
            hasInstitutionNumber ? "bankDetails" : "institutionNumber",
          ],
          message:
            "Institution number and transit/account must be provided together",
        });
      }

      if (
        (account.distributionType && !account.distributionValue) ||
        (account.distributionValue && !account.distributionType)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bankAccounts", index, "distributionValue"],
          message: "Distribution type and value must be provided together",
        });
      }

      if (account.distributionType === "REMAINDER") {
        remainderCount += 1;
      }

      if (
        account.distributionType === "PERCENTAGE" &&
        account.distributionValue
      ) {
        const percentageValue = Number.parseFloat(
          account.distributionValue.replace(/,/g, "").trim(),
        );
        if (Number.isNaN(percentageValue) || percentageValue > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["bankAccounts", index, "distributionValue"],
            message: "Percentage value must be 100 or less",
          });
        }
      }
    });

    if (remainderCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bankAccounts"],
        message: "Only one account can use Remainder distribution",
      });
    }
  });

// Export the validated contact form shape.
export type ContactFormInput = z.infer<typeof contactSchema>;
