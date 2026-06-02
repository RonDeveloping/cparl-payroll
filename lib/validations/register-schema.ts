// lib/validations/register-schema.ts

import { z } from "zod";
import { passwordRules } from "./password-schema";

export const registerSchema = z
  .object({
    givenName: z
      .string()
      .trim()
      .min(1, "Given name is required")
      .refine((val) => !/\d/.test(val), {
        message: "Given name cannot contain numbers",
      }),
    familyName: z
      .string()
      .trim()
      .min(1, "Family name is required")
      .refine((val) => !/\d/.test(val), {
        message: "Family name cannot contain numbers",
      }),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
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

    password: passwordRules,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
