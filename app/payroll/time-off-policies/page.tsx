import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserTenants } from "@/lib/dal/tenant";
import prisma from "@/db/prismaDrizzle";
import { getSession } from "@/lib/session";
import {
  createEmptyTimeOffBenchmarkDraft,
  normalizeTimeOffBenchmarkDraft,
  parseOptionalTimeOffNumber,
  type TimeOffBenchmarkDraft,
} from "@/constants/time-off-policies";
import TimeOffPoliciesForm from "./time-off-policies-form";

const TIME_OFF_POLICY_ROWS = [
  { key: "vacationTimeOff", policyType: "VACATION" },
  { key: "sickTimeOff", policyType: "SICK" },
  { key: "personalTimeOff", policyType: "UNPAID" },
] as const;

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

  if (displayName) return displayName;
  if (aliasName && coreName) {
    if (aliasName === legalName) return legalName || aliasName;

    return `${coreName}${kindName ? ` ${kindName}` : ""} (o/a ${aliasName})`;
  }

  if (legalName) return legalName;
  if (aliasName) return aliasName;

  return fallback;
}

export default async function PayrollTimeOffPoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const { tenantId } = await searchParams;
  const normalizedTenantId = (tenantId || "").split("?")[0].trim();
  const tenants = await getUserTenants();
  const activeTenants = tenants.filter((tenant) => tenant.isActive);
  const selectedTenant = normalizedTenantId
    ? (tenants.find((tenant) => tenant.id === normalizedTenantId) ?? null)
    : null;
  const preferredTenant = normalizedTenantId
    ? selectedTenant
    : (activeTenants[0] ?? tenants[0] ?? null);

  const selectedTenantId = preferredTenant?.id ?? "";
  const employerName = preferredTenant
    ? getEmployerDisplayName(preferredTenant.nameCached)
    : "No employer selected";
  const backToPayrollHref = selectedTenantId
    ? `/payroll?tenantId=${selectedTenantId}`
    : "/payroll";

  if (!selectedTenantId) {
    redirect("/payroll");
  }

  const benchmarkRows = await prisma.tenantTimeOffBenchmarkPolicy.findMany({
    where: { tenantId: selectedTenantId },
    select: {
      policyType: true,
      accrualFrequency: true,
      accrualRatePercent: true,
      annualAllowanceHours: true,
      hourCapHours: true,
    },
  });

  const initialDraft = createEmptyTimeOffBenchmarkDraft();
  const rowByPolicyType = new Map(
    benchmarkRows.map((row) => [row.policyType, row] as const),
  );

  for (const row of TIME_OFF_POLICY_ROWS) {
    const persisted = rowByPolicyType.get(row.policyType);
    if (!persisted) continue;

    initialDraft.frequency[row.key] = persisted.accrualFrequency || "";
    initialDraft.accrualRate[row.key] =
      persisted.accrualRatePercent?.toString() || "";
    initialDraft.annualAllowance[row.key] =
      persisted.annualAllowanceHours?.toString() || "";
    initialDraft.hourCap[row.key] = persisted.hourCapHours?.toString() || "";
  }

  async function saveTimeOffBenchmarkPolicies(formData: FormData) {
    "use server";

    const session = await getSession();
    if (!session?.userId) return;

    const tenantId = String(formData.get("tenantId") || "").trim();
    const rawDraft = String(formData.get("draft") || "").trim();
    if (!tenantId || !rawDraft) return;

    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        members: { some: { userId: session.userId } },
      },
      select: { id: true },
    });
    if (!tenant) return;

    let parsedDraft: Partial<TimeOffBenchmarkDraft> | null = null;
    try {
      parsedDraft = JSON.parse(rawDraft) as Partial<TimeOffBenchmarkDraft>;
    } catch {
      return;
    }

    const draft = normalizeTimeOffBenchmarkDraft(parsedDraft);

    for (const row of TIME_OFF_POLICY_ROWS) {
      await prisma.tenantTimeOffBenchmarkPolicy.upsert({
        where: {
          unique_time_off_benchmark_policy_per_tenant: {
            tenantId,
            policyType: row.policyType,
          },
        },
        update: {
          accrualFrequency: draft.frequency[row.key] || null,
          accrualRatePercent: parseOptionalTimeOffNumber(
            draft.accrualRate[row.key],
          ),
          annualAllowanceHours: parseOptionalTimeOffNumber(
            draft.annualAllowance[row.key],
          ),
          hourCapHours: parseOptionalTimeOffNumber(draft.hourCap[row.key]),
        },
        create: {
          tenantId,
          policyType: row.policyType,
          accrualFrequency: draft.frequency[row.key] || null,
          accrualRatePercent: parseOptionalTimeOffNumber(
            draft.accrualRate[row.key],
          ),
          annualAllowanceHours: parseOptionalTimeOffNumber(
            draft.annualAllowance[row.key],
          ),
          hourCapHours: parseOptionalTimeOffNumber(draft.hourCap[row.key]),
        },
      });
    }

    revalidatePath("/payroll/time-off-policies");
    revalidatePath(`/payroll/time-off-policies?tenantId=${tenantId}`);
  }

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Payroll Setup
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Time-Off Benchmark Policies
              </h1>
              <p className="mt-2 text-slate-600">
                Configure default accrual settings for {employerName}. Use these
                values as your baseline when setting up employees.
              </p>
            </div>
            <Link
              href={backToPayrollHref}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
            >
              Back to Payroll Overview
            </Link>
          </div>
        </header>

        <TimeOffPoliciesForm
          key={selectedTenantId || "default"}
          tenantId={selectedTenantId}
          initialDraft={initialDraft}
          saveTimeOffBenchmarkPolicies={saveTimeOffBenchmarkPolicies}
        />
      </div>
    </div>
  );
}
