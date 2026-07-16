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
        contactId: true,
        nameCached: true,
        slug: true,
        businessBn9: true,
        businessProgramId: true,
        programRefNum: true,
        isActive: true,
        createdAt: true,
        paySchedules: {
          where: { isActive: true },
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: {
            frequency: true,
            timingDays: true,
            payday: true,
            payWeekday: true,
            payday2: true,
            periodEndDay: true,
            periodEndWeekday: true,
            boundaryShift: true,
            periodEndDay2: true,
            boundaryShift2: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const contactIds = tenants
      .map((tenant) => tenant.contactId)
      .filter((value): value is string => Boolean(value));

    const primaryAddresses =
      contactIds.length > 0
        ? await prisma.address.findMany({
            where: {
              contactId: { in: contactIds },
              isPrimary: true,
            },
            select: {
              contactId: true,
              postalCode: true,
            },
          })
        : [];

    const postalCodeByContactId = new Map(
      primaryAddresses.map((address) => [
        address.contactId,
        address.postalCode,
      ]),
    );

    return NextResponse.json(
      tenants.map((tenant) =>
        toTenantSummaryDto({
          id: tenant.id,
          nameCached: tenant.nameCached,
          slug: tenant.slug,
          businessBn9: tenant.businessBn9,
          businessProgramId: tenant.businessProgramId,
          programRefNum: tenant.programRefNum,
          isActive: tenant.isActive,
          createdAt: tenant.createdAt,
          postalCode: postalCodeByContactId.get(tenant.contactId) ?? null,
          paySchedule: tenant.paySchedules[0] ?? null,
        }),
      ),
    );
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 },
    );
  }
}
