"use server";

import { TenantFormInput } from "@/lib/validations/tenant-schema";
import prisma from "@/db/prismaDrizzle";
import { safe } from "@/utils/validators/safe";
import { getSession } from "@/lib/session";

/**
 * Updates an existing tenant or creates a new one.
 */
export async function upsertTenant(data: TenantFormInput, id?: string) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Unauthorized" } as const;
  }

  const normalizedSlug = data.slug.toLowerCase().trim();
  const memberEmailList = (data.memberEmails ?? "")
    .split(/[,;\n]/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const userRole = data.userRole ?? "owner";

  return await safe(
    prisma.$transaction(async (tx) => {
      // Check if slug is already taken (if creating or slug changed)
      if (!id || id === "new") {
        const existingSlug = await tx.tenant.findUnique({
          where: { slug: normalizedSlug },
        });
        if (existingSlug) {
          throw new Error("This slug is already taken");
        }
      } else {
        const existingSlug = await tx.tenant.findFirst({
          where: {
            slug: normalizedSlug,
            NOT: { id },
          },
        });
        if (existingSlug) {
          throw new Error("This slug is already taken");
        }
      }

      const tenant = await tx.tenant.upsert({
        where: { id: id && id !== "new" ? id : "placeholder-id" },
        update: {
          name: data.name,
          slug: normalizedSlug,
          legalName: data.legalName,
          businessNumber: data.businessNumber ?? null,
          isActive: data.isActive,
        },
        create: {
          name: data.name,
          slug: normalizedSlug,
          legalName: data.legalName,
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
          update: { role: userRole },
          create: {
            tenantId: tenant.id,
            userId: session.userId,
            role: userRole,
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
            role: "member",
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
