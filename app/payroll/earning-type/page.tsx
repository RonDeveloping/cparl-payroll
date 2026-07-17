// app/payroll/earning-type/page.tsx
import Link from "next/link";
import { EarningType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "@/db/prismaDrizzle";
import { getSession } from "@/lib/session";
import { getUserTenants } from "@/lib/dal/tenant";
import {
  EARNING_TYPE_OPTIONS,
  isEarningTypeValue,
} from "@/constants/earning-types";
import EarningCodeForm from "./earning-code-form";

function getEmployerDisplayName(nameCached: unknown): string {
  const fallback = "Employer";
  if (!nameCached || typeof nameCached !== "object") return fallback;

  const record = nameCached as {
    coreName?: unknown;
    kindName?: unknown;
    aliasName?: unknown;
    displayName?: unknown;
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

  if (legalName) return legalName;
  if (displayName) return displayName;
  if (aliasName) return aliasName;

  return fallback;
}

const earningTypeOptions = EARNING_TYPE_OPTIONS;

async function addEarningCode(formData: FormData) {
  "use server";

  const session = await getSession();
  if (!session?.userId) return;

  const tenantId = String(formData.get("tenantId") || "").trim();
  const code = String(formData.get("code") || "")
    .trim()
    .toUpperCase();
  const description = String(formData.get("description") || "").trim();
  const earningTypeRaw = String(formData.get("earningType") || "");
  const isHourly = formData.get("isHourly") === "on";
  const isTaxable = formData.get("isTaxable") === "on";
  const isInKind = formData.get("isInKind") === "on";
  const isSubjectToCPP = formData.get("isSubjectToCPP") === "on";
  const isSubjectToEI = formData.get("isSubjectToEI") === "on";
  const t4BoxRaw = String(formData.get("t4BoxNumber") || "").trim();

  if (!tenantId || !code || !description) return;
  if (!isEarningTypeValue(earningTypeRaw)) return;

  const earningType = earningTypeRaw as EarningType;

  const tenant = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
      members: {
        some: { userId: session.userId },
      },
    },
    select: { id: true },
  });

  if (!tenant) return;

  const t4BoxNumber = t4BoxRaw ? Number.parseInt(t4BoxRaw, 10) : null;

  await prisma.earningCode.create({
    data: {
      tenantId,
      code,
      description,
      earningType,
      isHourly,
      isTaxable,
      isInKind,
      isSubjectToCPP,
      isSubjectToEI,
      t4BoxNumber: Number.isFinite(t4BoxNumber as number)
        ? (t4BoxNumber as number)
        : null,
    },
  });

  revalidatePath("/payroll/earning-type");
  revalidatePath(`/payroll/earning-type?tenantId=${tenantId}`);
}

async function deleteEarningCode(formData: FormData) {
  "use server";

  const session = await getSession();
  if (!session?.userId) return;

  const tenantId = String(formData.get("tenantId") || "").trim();
  const earningCodeId = String(formData.get("earningCodeId") || "").trim();

  if (!tenantId || !earningCodeId) return;

  const tenant = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
      members: {
        some: { userId: session.userId },
      },
    },
    select: { id: true },
  });

  if (!tenant) return;

  await prisma.earningCode.deleteMany({
    where: {
      id: earningCodeId,
      tenantId,
    },
  });

  revalidatePath("/payroll/earning-type");
  revalidatePath(`/payroll/earning-type?tenantId=${tenantId}`);
}

export default async function EarningTypePage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string | string[] }>;
}) {
  const { tenantId } = await searchParams;
  const tenantIdValue = Array.isArray(tenantId) ? tenantId[0] : tenantId;
  const normalizedTenantId = (tenantIdValue || "").split("?")[0].trim();
  const tenants = await getUserTenants();
  const activeTenants = tenants.filter((tenant) => tenant.isActive);
  const selectedTenant = normalizedTenantId
    ? (tenants.find((tenant) => tenant.id === normalizedTenantId) ?? null)
    : null;
  const preferredTenant =
    selectedTenant ?? activeTenants[0] ?? tenants[0] ?? null;

  if (!preferredTenant) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">EarningType</h1>
          <p className="mt-3 text-slate-600">
            No employer context is available. Choose an employer first.
          </p>
          <Link
            href="/tenants"
            className="mt-5 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Go to Employers
          </Link>
        </section>
      </main>
    );
  }

  const employerName = getEmployerDisplayName(preferredTenant.nameCached);
  const earningCodes = await prisma.earningCode.findMany({
    where: { tenantId: preferredTenant.id },
    orderBy: [{ code: "asc" }],
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                EarningType
              </h1>
              <p className="mt-2 text-slate-600">
                Configure earning codes for {employerName}.
              </p>
            </div>
            <Link
              href={`/payroll?tenantId=${preferredTenant.id}`}
              className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900"
            >
              Back to Payroll Overview
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Add Earning Code
          </h2>
          <EarningCodeForm
            tenantId={preferredTenant.id}
            addEarningCode={addEarningCode}
            earningTypeOptions={earningTypeOptions}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Existing Earning Codes
          </h2>

          {earningCodes.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              No earning codes configured yet for this employer.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Code
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Description
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Hourly
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Taxable
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      In Kind
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      CPP
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      EI
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      T4 Box
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {earningCodes.map((earningCode) => (
                    <tr key={earningCode.id}>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {earningCode.code}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {earningCode.description}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {earningCode.earningType}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {(earningCode as { isHourly?: boolean }).isHourly
                          ? "Yes"
                          : "No"}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {earningCode.isTaxable ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {earningCode.isInKind ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {earningCode.isSubjectToCPP ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {earningCode.isSubjectToEI ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {earningCode.t4BoxNumber ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <form action={deleteEarningCode}>
                          <input
                            type="hidden"
                            name="tenantId"
                            value={preferredTenant.id}
                          />
                          <input
                            type="hidden"
                            name="earningCodeId"
                            value={earningCode.id}
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
