// lib/auth-utils.ts
import { getSession } from "@/lib/session"; // The helper we built earlier
import prisma from "@/db/prismaDrizzle";

export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    // Only select what you need for security and performance
    select: {
      id: true,
      email: true,
      emailVerifiedAt: true,
      contactId: true,
    },
  });

  if (!user) return null;

  const contact = user.contactId
    ? await prisma.contact.findUnique({
        where: { id: user.contactId },
        select: {
          coreName: true,
          kindName: true,
          displayName: true,
          aliasName: true,
          addresses: {
            where: { isPrimary: true },
            select: { postalCode: true },
            take: 1,
          },
        },
      })
    : null;

  const primaryPostalCode = contact?.addresses?.[0]?.postalCode ?? null;

  return {
    ...user,
    givenName: contact?.coreName ?? null,
    familyName: contact?.kindName ?? null,
    displayName: contact?.displayName ?? null,
    nickName: contact?.aliasName ?? null,
    primaryPostalCode,
  };
}
