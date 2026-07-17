// app/payroll/page.tsx
import Link from "next/link";
import { getUserTenants } from "@/lib/dal/tenant";
import prisma from "@/db/prismaDrizzle";

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

function getEmployeeDisplayName(nameCached: unknown): string {
  if (!nameCached || typeof nameCached !== "object") return "Unnamed employee";

  const record = nameCached as {
    displayName?: unknown;
    coreName?: unknown;
    kindName?: unknown;
    aliasName?: unknown;
  };

  const displayName =
    typeof record.displayName === "string" ? record.displayName.trim() : "";
  const coreName =
    typeof record.coreName === "string" ? record.coreName.trim() : "";
  const kindName =
    typeof record.kindName === "string" ? record.kindName.trim() : "";
  const aliasName =
    typeof record.aliasName === "string" ? record.aliasName.trim() : "";

  if (displayName) return displayName;
  const fullName = [coreName, kindName].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;
  if (aliasName) return aliasName;
  return "Unnamed employee";
}

export default async function PayrollOverviewPage({
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
  const hasInvalidTenantSelection = Boolean(normalizedTenantId) && !selectedTenant;
  const preferredTenant = normalizedTenantId
    ? selectedTenant
    : (activeTenants[0] ?? tenants[0] ?? null);
  const showTenantDebugInfo =
    process.env.NODE_ENV !== "production" && hasInvalidTenantSelection;

  const employerName = preferredTenant
    ? getEmployerDisplayName(preferredTenant.nameCached)
    : "No employer selected";
  const selectedTenantId = preferredTenant?.id ?? "";
  const payrollHref = selectedTenantId
    ? `/payroll?tenantId=${selectedTenantId}`
    : "/payroll";
  const startPayrollHref = `${payrollHref}#upcoming-payroll-calendar`;
  const earningTypeHref = selectedTenantId
    ? `/payroll/earning-type?tenantId=${selectedTenantId}`
    : "/payroll/earning-type";
  const viewEmployeesHref = selectedTenantId
    ? `/employees?tenantId=${selectedTenantId}`
    : "/employees";
  const totalEmployeeCount = selectedTenantId
    ? await prisma.employee.count({ where: { tenantId: selectedTenantId } })
    : 0;
  const employees = selectedTenantId
    ? await prisma.employee.findMany({
        where: { tenantId: selectedTenantId },
        select: {
          contactId: true,
          nameCached: true,
          emailCached: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {showTenantDebugInfo ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Tenant lookup mismatch (dev only)</p>
            <p className="mt-1">Requested tenantId: {tenantId}</p>
            <p className="mt-1">Normalized tenantId: {normalizedTenantId}</p>
            <p className="mt-1">Matched in accessible tenants: no</p>
            <p className="mt-1">
              Accessible tenant ids (first 3):{" "}
              {tenants
                .slice(0, 3)
                .map((tenant) => tenant.id)
                .join(", ") || "none"}
            </p>
          </section>
        ) : null}

        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">
                {`Payroll Overview of ${employerName}`}
              </h1>
              <p className="mt-2 text-slate-600">
                Monitor upcoming runs, funding readiness, and compliance status
                for this employer.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={startPayrollHref}
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Payroll Run
              </Link>
              <Link
                href={earningTypeHref}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                EarningType
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  label: "Next Run",
                  value: "Feb 28, 2026",
                  meta: "Biweekly - 54 employees",
                },
                {
                  label: "Funding Status",
                  value: "Ready",
                  meta: "Bank file pending approval",
                },
                {
                  label: "Net Pay Total",
                  value: "$128,450",
                  meta: "Current draft",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{card.meta}</p>
                </div>
              ))}
            </div>

            <div
              id="upcoming-payroll-calendar"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Upcoming Payroll Calendar
                </h2>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                  This Month
                </span>
              </div>
              <div className="mt-6 grid gap-4">
                {[
                  {
                    date: "Feb 20",
                    title: "Time approvals due",
                    detail: "Managers submit final timecards",
                  },
                  {
                    date: "Feb 24",
                    title: "Funding window",
                    detail: "Verify bank balances and approvals",
                  },
                  {
                    date: "Feb 28",
                    title: "Payroll run",
                    detail: "Disbursement scheduled at 5:00 PM",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-semibold text-emerald-700">
                      {item.date}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-sm text-slate-600">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              id="payroll-activity"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Payroll Activity
                </h2>
                <Link
                  href={payrollHref}
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-600"
                >
                  View all activity
                </Link>
              </div>
              <div className="mt-5 space-y-4">
                {[
                  {
                    label: "Payroll draft updated",
                    detail: "12 employee changes applied",
                    time: "Today, 9:12 AM",
                  },
                  {
                    label: "Funding approved",
                    detail: "Bank file ready for submission",
                    time: "Yesterday, 4:45 PM",
                  },
                  {
                    label: "Tax remittance scheduled",
                    detail: "CRA payment set for Feb 25",
                    time: "Feb 14, 2026",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.label}
                      </p>
                      <p className="text-sm text-slate-500">{item.detail}</p>
                    </div>
                    <span className="text-xs text-slate-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Compliance
              </h3>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Tax filing", value: "On track" },
                  { label: "T4 updates", value: "Pending review" },
                  { label: "Audit prep", value: "Ready" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-semibold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Employees ({totalEmployeeCount})
                </h2>
                <div className="flex items-center gap-4">
                  <Link
                    href={viewEmployeesHref}
                    className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                  >
                    View all
                  </Link>
                </div>
              </div>

              {totalEmployeeCount > employees.length && (
                <p className="mt-2 text-xs text-slate-500">
                  Showing the most recent {employees.length} of{" "}
                  {totalEmployeeCount} employees.
                </p>
              )}

              {employees.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  No employees linked to this employer yet.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {employees.map((employee) => (
                    <div
                      key={`${employee.contactId}-${employee.createdAt.toISOString()}`}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {getEmployeeDisplayName(employee.nameCached)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {employee.emailCached || "No email on file"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {employee.status.toLowerCase()}
                        </span>
                        <Link
                          href={`/employees/${employee.contactId}/edit?tenantId=${selectedTenantId}`}
                          className="text-sm font-semibold text-emerald-700 hover:text-emerald-600"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-emerald-900">
              <h3 className="text-base font-semibold">Suggested next step</h3>
              <p className="mt-2 text-sm text-emerald-800">
                Confirm timecard approvals for February 20 and release funding
                confirmations before Feb 24.
              </p>
              <Link
                href={payrollHref}
                className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-600"
              >
                Open checklist
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
