// lib/schemas/contact.ts
import { z } from "zod";

export const contactSchema = z.object({
  givenName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  familyName: z.string().min(1, "Last name is required"),
  nickName: z.string().optional(),
  displayName: z.string().optional(),
  email: z.string().email("Invalid email address").toLowerCase(),
  phone: z.string().min(10, "Invalid phone number"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(6, "Invalid Postal Code"),
});

// Export the type so both frontend and backend can use it
export type ContactFormValues = z.infer<typeof contactSchema>;
