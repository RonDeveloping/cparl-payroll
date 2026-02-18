import { z } from "zod";

export const tenantSchema = z.object({
  name: z.string().min(1, "Tenant name is required"),
  slug: z
    .string()
    .min(1, "URL slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  legalName: z.string().min(1, "Legal name is required"),
  businessNumber: z.string().optional().nullable(),
  isActive: z.boolean(),
  userRole: z.enum(["owner", "admin", "member"]).optional(),
  memberEmails: z.string().optional(),
});

export type TenantFormInput = z.infer<typeof tenantSchema>;
