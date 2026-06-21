// app/tenants/[id]/page.tsx

import { notFound, redirect } from "next/navigation";
import prisma from "@/db/prismaDrizzle";

export default async function TenantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { id },
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
  });

  if (!tenant) {
    notFound();
  }

  redirect(`/payroll?tenantId=${tenant.id}`);
}
