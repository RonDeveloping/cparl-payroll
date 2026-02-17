import * as z from "zod";

export const passwordRules = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100)
  .regex(/[A-Z]/, "Password must contain at least one UPPERCASE letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number(1-9).")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Password must include at least one symbol like !@#$%^&*.",
  );

// 2. Define the Reset Schema independently
export const resetPasswordSchema = z
  .object({
    password: passwordRules,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
