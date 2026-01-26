import { z } from "zod";

export const UserRegistrationSchema = z.object({
  // 1. SLUG VALIDATION
  // Ensures the handle is URL-friendly and case-consistent
  slug: z
    .string()
    .min(3, "User ID must be at least 3 characters")
    .max(255, "User ID must be under 255 characters")
    .trim()
    .toLowerCase()
    // Regex: Only letters, numbers, dots, hyphens, and underscores. No spaces.
    .regex(/^[a-z0-9.@_-]+$/, {
      message:
        "User ID can only contain letters, numbers, @, dots, hyphens, and underscores",
    }),

  // 2. PASSWORD VALIDATION
  // Enforces complexity before hashing
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),

  email: z.string().email("Invalid email address").trim().toLowerCase(),
});

export type UserRegistrationValues = z.infer<typeof UserRegistrationSchema>;
