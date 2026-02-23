"use server";

import { TenantFormInput } from "@/lib/validations/tenant-schema";
import prisma from "@/db/prismaDrizzle";
import { safe } from "@/utils/validators/safe";
import { getSession } from "@/lib/session";
import {
  generateTenantSlug,
  trimDuplicateEnding,
} from "@/utils/formatters/slugify";
import { upsertAddress } from "@/lib/utils/address-hash";

/**
 * Updates an existing tenant or creates a new one.
 */
export async function upsertTenant(data: TenantFormInput, id?: string) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Unauthorized" } as const;
  }

  // Trim coreName if it ends with legalNameEnding to avoid duplication
  const trimmedCoreName = trimDuplicateEnding(
    data.coreName,
    data.legalNameEnding,
  );

  // Generate slug from trimmed coreName and legalNameEnding
  const generatedSlug = generateTenantSlug(
    trimmedCoreName,
    data.legalNameEnding,
  );
  const memberEmailList = (data.memberEmails ?? "")
    .split(/[,;\n]/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return await safe(
    prisma.$transaction(async (tx) => {
      // Check if slug is already taken (if creating or slug changed)
      if (!id || id === "new") {
        const existingSlug = await tx.tenant.findUnique({
          where: { slug: generatedSlug },
        });
        if (existingSlug) {
          throw new Error("This slug is already taken");
        }
      } else {
        const existingSlug = await tx.tenant.findFirst({
          where: {
            slug: generatedSlug,
            NOT: { id },
          },
        });
        if (existingSlug) {
          throw new Error("This slug is already taken");
        }
      }

      // Create or update Contact record
      let contactId: string;
      let contactForCache: {
        coreName: string;
        kindName: string;
        middleName: string | null;
        prefix: string | null;
        suffix: string | null;
        aliasName: string | null;
        displayName: string | null;
      } | null = null;

      if (!id || id === "new") {
        // Create new contact for new tenant
        const contact = await tx.contact.create({
          data: {
            coreName: trimmedCoreName,
            kindName: data.legalNameEnding || "", // Empty string if null
            subject: "ORGANIZATION", // Assuming organization type
            source: "USER", // User-provided input
          },
        });
        contactId = contact.id;
        contactForCache = {
          coreName: contact.coreName,
          kindName: contact.kindName,
          middleName: contact.middleName,
          prefix: contact.prefix,
          suffix: contact.suffix,
          aliasName: contact.aliasName,
          displayName: contact.displayName,
        };

        // Save email, phone, and address to contact
        if (data.email) {
          await tx.email.create({
            data: {
              contactId: contact.id,
              emailAddress: data.email.toLowerCase(),
              isPrimary: true,
            },
          });
        }

        if (data.phone) {
          await tx.phone.create({
            data: {
              contactId: contact.id,
              number: data.phone,
              type: "MOBILE",
              isPrimary: true,
            },
          });
        }

        if (data.address && Object.values(data.address).some((v) => v)) {
          await upsertAddress(tx, contact.id, data.address);
        }
      } else {
        // Fetch existing contact (if any) and update it
        const existingTenant = await tx.tenant.findUnique({
          where: { id },
        });

        if (existingTenant && existingTenant.contactId) {
          // Update existing contact
          const contact = await tx.contact.update({
            where: { id: existingTenant.contactId },
            data: {
              coreName: trimmedCoreName,
              kindName: data.legalNameEnding || "",
            },
          });
          contactForCache = {
            coreName: contact.coreName,
            kindName: contact.kindName,
            middleName: contact.middleName,
            prefix: contact.prefix,
            suffix: contact.suffix,
            aliasName: contact.aliasName,
            displayName: contact.displayName,
          };

          // Update or create email
          if (data.email) {
            const existingEmail = await tx.email.findFirst({
              where: {
                contactId: existingTenant.contactId,
                isPrimary: true,
              },
            });

            if (existingEmail) {
              await tx.email.update({
                where: { id: existingEmail.id },
                data: { emailAddress: data.email.toLowerCase() },
              });
            } else {
              await tx.email.create({
                data: {
                  contactId: existingTenant.contactId,
                  emailAddress: data.email.toLowerCase(),
                  isPrimary: true,
                },
              });
            }
          }

          // Update or create phone
          if (data.phone) {
            const existingPhone = await tx.phone.findFirst({
              where: {
                contactId: existingTenant.contactId,
                isPrimary: true,
              },
            });

            if (existingPhone) {
              await tx.phone.update({
                where: { id: existingPhone.id },
                data: { number: data.phone },
              });
            } else {
              await tx.phone.create({
                data: {
                  contactId: existingTenant.contactId,
                  number: data.phone,
                  type: "MOBILE",
                  isPrimary: true,
                },
              });
            }
          }

          // Update or create address
          if (data.address && Object.values(data.address).some((v) => v)) {
            await upsertAddress(tx, existingTenant.contactId, data.address);
          }

          contactId = existingTenant.contactId;
        } else {
          // Create new contact if one doesn't exist
          const contact = await tx.contact.create({
            data: {
              coreName: trimmedCoreName,
              kindName: data.legalNameEnding || "",
              subject: "ORGANIZATION",
              source: "USER", // User-provided input
            },
          });

          // Save email, phone, and address
          if (data.email) {
            await tx.email.create({
              data: {
                contactId: contact.id,
                emailAddress: data.email.toLowerCase(),
                isPrimary: true,
              },
            });
          }

          if (data.phone) {
            await tx.phone.create({
              data: {
                contactId: contact.id,
                number: data.phone,
                type: "MOBILE",
                isPrimary: true,
              },
            });
          }

          if (data.address && Object.values(data.address).some((v) => v)) {
            await upsertAddress(tx, contact.id, data.address);
          }

          contactId = contact.id;
          contactForCache = {
            coreName: contact.coreName,
            kindName: contact.kindName,
            middleName: contact.middleName,
            prefix: contact.prefix,
            suffix: contact.suffix,
            aliasName: contact.aliasName,
            displayName: contact.displayName,
          };
        }
      }

      const nameCached = contactForCache
        ? {
            coreName: contactForCache.coreName,
            kindName: contactForCache.kindName,
            middleName: contactForCache.middleName,
            prefix: contactForCache.prefix,
            suffix: contactForCache.suffix,
            aliasName: contactForCache.aliasName,
            displayName: contactForCache.displayName,
          }
        : {
            coreName: trimmedCoreName,
            kindName: data.legalNameEnding,
            middleName: null,
            prefix: null,
            suffix: null,
            aliasName: null,
            displayName: null,
          };

      const tenant = await tx.tenant.upsert({
        where: { id: id && id !== "new" ? id : "placeholder-id" },
        update: {
          nameCached: nameCached,
          slug: generatedSlug,
          contactId: contactId,
          businessNumber: data.businessNumber ?? null,
          isActive: data.isActive,
        },
        create: {
          nameCached: nameCached,
          slug: generatedSlug,
          contactId: contactId,
          businessNumber: data.businessNumber ?? null,
          isActive: data.isActive,
          settings: {
            create: {
              timezone: "America/Toronto",
            },
          },
        },
        include: {
          settings: true,
          members: true,
        },
      });

      if (!id || id === "new") {
        await tx.tenantUser.upsert({
          where: {
            tenantId_userId: { tenantId: tenant.id, userId: session.userId },
          },
          update: { role: "OWNER" },
          create: {
            tenantId: tenant.id,
            userId: session.userId,
            role: "OWNER",
          },
        });
      }

      if (memberEmailList.length > 0) {
        const users = await tx.user.findMany({
          where: { slug: { in: memberEmailList } },
          select: { id: true },
        });

        const memberRows = users
          .filter((user) => user.id !== session.userId)
          .map((user) => ({
            tenantId: tenant.id,
            userId: user.id,
            role: "EMPLOYEE" as const,
          }));

        if (memberRows.length > 0) {
          await tx.tenantUser.createMany({
            data: memberRows,
            skipDuplicates: true,
          });
        }
      }

      return tenant;
    }),
  );
}
