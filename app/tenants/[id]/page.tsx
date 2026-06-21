// app/tenants/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/db/prismaDrizzle";
import { toTenantSummaryDto } from "@/lib/dto/tenant";

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

  const summary = toTenantSummaryDto(tenant);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {summary.displayName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">Slug: {summary.slug}</p>
            <p className="mt-1 text-sm text-slate-600">
              Business Number: {summary.displayBusinessNumber || "Not provided"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Status: {summary.isActive ? "Active" : "Inactive"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/tenants/${summary.id}/edit`}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Edit Employer
            </Link>
            <Link
              href={`/payroll?tenantId=${summary.id}`}
              className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Open Payroll
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
