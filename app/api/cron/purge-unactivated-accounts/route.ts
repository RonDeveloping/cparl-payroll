// app/api/cron/purge-unactivated-accounts/route.ts
//
// Purges verified accounts that never set a password and are older than 40 days.
// Intended to be called by a scheduled cron job (e.g. Vercel Cron).
// Protected by CRON_SECRET to prevent unauthorised invocations.

import { NextResponse } from "next/server";
import prisma from "@/db/prismaDrizzle";

const PURGE_AFTER_DAYS = 40;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PURGE_AFTER_DAYS);

  const { count } = await prisma.user.deleteMany({
    where: {
      emailVerifiedAt: { not: null },
      passwordHash: null,
      createdAt: { lt: cutoff },
    },
  });

  return NextResponse.json({ purged: count });
}
