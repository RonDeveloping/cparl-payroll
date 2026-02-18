// lib/dal/tenant.ts
import { cache } from "react";
import prisma from "@/db/prismaDrizzle";
import { getSession } from "@/lib/session";

/**
 * Get a tenant by ID with access control
 */
export const getTenantById = cache(async (tenantId: string) => {
  const session = await getSession();
  if (!session?.userId) return null;

  return await prisma.tenant.findUnique({
    where: {
      id: tenantId,
      members: {
        some: { userId: session.userId },
      },
    },
    include: {
      settings: true,
      members: true,
    },
  });
});

/**
 * Get all tenants associated with the current user
 */
export const getUserTenants = cache(async () => {
  const session = await getSession();
  if (!session?.userId) return [];

  return await prisma.tenant.findMany({
    where: {
      members: {
        some: { userId: session.userId },
      },
    },
    include: {
      settings: true,
      members: true,
    },
  });
});
