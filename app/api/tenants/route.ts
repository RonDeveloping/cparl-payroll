// app/api/tenants/route.ts
import prisma from "@/db/prismaDrizzle";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { toTenantSummaryDto } from "@/lib/dto/tenant";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenants = await prisma.tenant.findMany({
      where: {
        members: {
          some: { userId: session.userId },
        },
      },
      select: {
        id: true,
        nameCached: true,
        slug: true,
        businessBn9: true,
        businessProgramId: true,
        programRefNum: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tenants.map(toTenantSummaryDto));
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 },
    );
  }
}
