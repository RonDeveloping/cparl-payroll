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
          if (!val) return true;
          const digits = val.replace(/\D/g, "");
          return digits.length == 10;
        },
        { message: "Phone number must contain 10 digits" },
      ),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(/[A-Z]/, "Password must contain at least one UPPERCASE letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number(1-9).")
      .regex(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        "Password must include at least one symbol like !@#$%^&*.",
      ),
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
