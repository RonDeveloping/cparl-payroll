// lib/validations/register-schema.ts

import { z } from "zod";

export const registerSchema = z
  .object({
    givenName: z.string().min(1, "Given name is required"),
    familyName: z.string().min(1, "Family name is required"),
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

    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type UserRegistrationInput = z.infer<typeof registerSchema>;
