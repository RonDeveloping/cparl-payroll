import { z } from "zod";

export const tenantSchema = z.object({
  coreName: z.string().min(1, "Organization name is required"),
  legalNameEnding: z
    .enum(["Inc.", "Corp.", "Ltd", "Limited", "Incorporated", "Corporation"])
    .optional()
    .nullable(),
  businessNumber: z.string().optional().nullable(),
  isActive: z.boolean(),
  memberEmails: z.string().optional(),
  // Contact information fields
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z
    .object({
      street: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      province: z.string().optional().nullable(),
      postalCode: z.string().optional().nullable(),
      country: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  // slug is auto-generated from coreName and legalNameEnding, not user input
});

export type TenantFormInput = z.infer<typeof tenantSchema>;
