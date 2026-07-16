// app/tenants/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/db/prismaDrizzle";
import { getUserTenants } from "@/lib/dal/tenant";

function getEmployerDisplayName(nameCached: unknown): string {
  const fallback = "Employer";
  if (!nameCached || typeof nameCached !== "object") return fallback;

  const record = nameCached as {
    displayName?: unknown;
    coreName?: unknown;
    kindName?: unknown;
    aliasName?: unknown;
  };

  const displayName =
    typeof record.displayName === "string" ? record.displayName.trim() : "";
  const aliasName =
    typeof record.aliasName === "string" ? record.aliasName.trim() : "";
  const coreName =
    typeof record.coreName === "string" ? record.coreName.trim() : "";
  const kindName =
    typeof record.kindName === "string" ? record.kindName.trim() : "";
  const legalName = [coreName, kindName].filter(Boolean).join(" ").trim();

  if (displayName) return displayName;
  if (aliasName && coreName) {
    if (aliasName === legalName) return legalName || aliasName;

    return `${coreName}${kindName ? ` ${kindName}` : ""} (o/a ${aliasName})`;
  }

  if (legalName) return legalName;
  if (aliasName) return aliasName;

  return fallback;
}

function formatFullBusinessNumber(tenant: {
  businessBn9: string | null;
  businessProgramId: string | null;
  programRefNum: string | null;
}): string | null {
  const bn9 = (tenant.businessBn9 || "").replace(/\D/g, "").slice(0, 9);
  const programId = (tenant.businessProgramId || "").trim().toUpperCase();
  const accountRef = (tenant.programRefNum || "")
    .replace(/\D/g, "")
    .slice(0, 4)
    .padStart(4, "0");

  if (bn9.length !== 9 || programId.length !== 2 || accountRef.length !== 4) {
    return null;
  }

  return `${bn9} ${programId}${accountRef}`;
}

export default async function TenantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [tenant, userTenants] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id },
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
      },
    }),
    getUserTenants(),
  ]);

  if (!tenant) {
    notFound();
  }

  const primaryAddress = await prisma.address.findFirst({
    where: { contactId: tenant.contactId, isPrimary: true },
    select: { postalCode: true },
  });

  const payrollDetails =
    userTenants.find((item) => item.id === tenant.id) ?? null;
  const employerName = getEmployerDisplayName(tenant.nameCached);
  const fullBusinessNumber = formatFullBusinessNumber(tenant);
  const payrollFrequency = payrollDetails?.payrollFrequency ?? null;
  const payPeriodEnd = payrollDetails?.payPeriodEnd ?? null;
  const paydaySummary = payrollDetails?.paydaySummary ?? null;
  const postalCode = primaryAddress?.postalCode ?? null;

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Employer details
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">
                {employerName}
              </h1>
              <p className="mt-2 text-slate-600">
                View employer profile, business number, and payroll context.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/payroll?tenantId=${tenant.id}`}
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Open Payroll
              </Link>
              <Link
                href={`/tenants/${tenant.id}/edit`}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                Edit Employer
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Business number
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {fullBusinessNumber || "Not set"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Status
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {tenant.isActive ? "Active" : "Inactive"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Postal code
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {postalCode || "Not set"}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Payroll context
          </h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">
                Payroll frequency
              </dt>
              <dd className="mt-1 font-medium text-slate-800">
                {payrollFrequency || "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">
                Pay period end
              </dt>
              <dd className="mt-1 font-medium text-slate-800">
                {payPeriodEnd || "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">
                Payday summary
              </dt>
              <dd className="mt-1 font-medium text-slate-800">
                {paydaySummary || "Not set"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Quick actions
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Jump to payroll or update employer information.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/payroll?tenantId=${tenant.id}`}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View Payroll Overview
            </Link>
            <Link
              href={`/tenants/${tenant.id}/edit`}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
            >
              Edit Details
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
