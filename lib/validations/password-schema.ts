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

export const resetPasswordSchema = z
  .object({
    password: passwordRules,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "The re-entered does not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const setupPasswordSchema = z
  .object({
    password: passwordRules,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "The re-entered does not match.",
    path: ["confirmPassword"],
  });

export type SetupPasswordInput = z.infer<typeof setupPasswordSchema>;
