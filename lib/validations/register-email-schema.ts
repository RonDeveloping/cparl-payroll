// lib/validations/register-email-schema.ts
import { z } from "zod";

export const registerEmailSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
});

export type RegisterEmailInput = z.infer<typeof registerEmailSchema>;
