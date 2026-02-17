// lib/dal/user-status.ts
import { cache } from "react";
import prisma from "@/db/prismaDrizzle";
import { getSession } from "@/lib/session";

export const getPhoneStatus = cache(async () => {
  const session = await getSession();
  if (!session?.userId) return null;

  // Artificial delay for testing:
  // await new Promise(res => setTimeout(res, 2000));

  return await prisma.user.findUnique({
    where: { id: session.userId },
    select: { phone: true, phoneVerifiedAt: true },
  });
});
