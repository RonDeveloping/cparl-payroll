// lib/schemas/contact.ts
import { z } from "zod";
import { isValidCanadianPostalCode } from "../validators/postalCode";

export const contactSchema = z.object({
  givenName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  familyName: z.string().min(1, "Last name is required"),
  nickName: z.string().optional(),
  displayName: z.string().optional(),
  email: z.string().email("Invalid email address").toLowerCase(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // optional field
        const digits = val.replace(/\D/g, "");
        return digits.length == 10;
      },
      { message: "Phone number must contain 10 digits" },
    ),
  street: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z
    .string()
    .nonempty("Postal code cannot be empty")
    .transform((val) => val.trim().toUpperCase()) //trim whitespace
    .refine(isValidCanadianPostalCode, {
      message: "Enter a valid Canadian postal code (e.g., K1A 0B1)",
    }),
});

// Export the type so both frontend and backend can use it
export type ContactFormValues = z.infer<typeof contactSchema>;
