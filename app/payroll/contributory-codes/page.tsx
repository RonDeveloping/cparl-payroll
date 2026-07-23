// app/payroll/contributory-codes/page.tsx
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { ContributoryCategory, ContributoryMethod } from "@prisma/client";
import prisma from "@/db/prismaDrizzle";
import { getSession } from "@/lib/session";
import { Clarification } from "@/components/clarification";
import { getUserTenants } from "@/lib/dal/tenant";
import { DEFAULT_EARNING_CODES } from "@/constants/earning-types";
import { contributoryCodeContent } from "@/constants/content";
import { T4_DEDUCTION_BOX_OPTIONS } from "@/constants/t4-boxes";
import EmployeeDeductionFields from "./employee-deduction-fields";
import EmployerParticipationFields from "./employer-participation-fields";
import ContributoryCodeList from "./contributory-code-list";

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

const CONTRIBUTORY_VALUE_OPTIONS: readonly {
  value: ContributoryMethod;
  label: string;
}[] = [
  { value: "FLAT_AMOUNT", label: "Flat amount" },
  { value: "PERCENT_OF_GROSS", label: "Percent of gross pay" },
  { value: "PER_HOUR_WORKED", label: "Per hour worked" },
  { value: "NONE", label: "None" },
];

const EMPLOYEE_DEDUCTION_VALUE_OPTIONS: readonly {
  value: ContributoryMethod;
  label: string;
}[] = [
  { value: "FLAT_AMOUNT", label: "Flat amount" },
  { value: "PERCENT_OF_GROSS", label: "Percent of gross pay" },
  { value: "PER_HOUR_WORKED", label: "Per hour worked" },
];

const CONTRIBUTORY_CATEGORY_OPTIONS: readonly {
  value: ContributoryCategory;
  label: string;
}[] = [
  {
    value: "HEALTH_INSURANCE",
    label: "Health insurance - e.g. medical, dental, vision",
  },
  {
    value: "RETIREMENT_PLAN",
    label: "Retirement plan - e.g. RRSP, pension, DPSP",
  },
  {
    value: "IN_KIND_BENEFIT",
    label: "In-kind benefit - e.g. life insurance, AD&D insurance",
  },
  {
    value: "PURE_DEDUCTION",
    label: "Pure deduction - e.g. union dues, charitable deduction",
  },
];

const CATEGORY_CLARIFICATION =
  "This helps reporting by grouping contributory codes into consistent categories for payroll and year-end summaries.";

const RATE_AMOUNT_CLARIFICATION =
  "For Flat amount, enter the annualized amount. For Per hour worked, enter the dollar amount per hour. For Percent of gross pay, enter the percentage to apply to gross pay.";

const DEDUCTION_EXCLUDED_EARNINGS_CLARIFICATION =
  "Enter the annualized earnings base that is excluded from this employee deduction. For Flat amount, treat this as the qualified-earnings threshold: the deduction is triggered only after earnings exceed this excluded amount.";

const PARTICIPATION_EXCLUDED_EARNINGS_CLARIFICATION =
  "Enter the annualized earnings base that is excluded from this employer participation amount. For Flat amount, treat this as the qualified-earnings threshold: employer participation is triggered only after earnings exceed this excluded amount.";

const DEDUCTION_LIMIT_CLARIFICATION =
  "Enter the annualized ceiling for this employee deduction.";

const PARTICIPATION_LIMIT_CLARIFICATION =
  "Enter the annualized ceiling for this employer participation amount.";

const codePattern = /^[A-Z0-9][A-Z0-9_-]{1,9}$/;
const allowedT4BoxValues = new Set(
  T4_DEDUCTION_BOX_OPTIONS.map((option) => option.value),
);
const allowedAtSourceValues = new Set(["POST_TAX", "PRE_TAX", "TAX_CREDIT"]);

function parseDecimal(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").replace("%", "").trim();
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function getContributoryCategoryLabel(category: ContributoryCategory): string {
  const label =
    CONTRIBUTORY_CATEGORY_OPTIONS.find((option) => option.value === category)
      ?.label ?? category;

  return label.replace(/\s*-\s*e\.g\..*$/i, "").trim();
}

async function saveContributoryCode(formData: FormData) {
  "use server";

  const session = await getSession();
  if (!session?.userId) return;

  const tenantId = String(formData.get("tenantId") || "").trim();
  const code = String(formData.get("code") || "")
    .trim()
    .toUpperCase();
  const categoryRaw = String(formData.get("category") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const employeeDeductionMethodRaw = String(
    formData.get("employeeDeductionMethod") || "",
  ).trim();
  const employeeDeductionRateRaw = String(
    formData.get("employeeDeductionRate") || "",
  ).trim();
  const employeeExemptEarningsRaw = String(
    formData.get("employeeExemptEarnings") || "0",
  ).trim();
  const employeeDeductionLimitRaw = String(
    formData.get("employeeDeductionLimit") || "",
  ).trim();
  const employeeDeductionAtSourceRaw = String(
    formData.get("employeeDeductionAtSource") || "POST_TAX",
  ).trim();
  const employeeT4BoxRaw = String(
    formData.get("employeeT4BoxNumber") || "",
  ).trim();
  const employerParticipationMethodRaw = String(
    formData.get("employerParticipationMethod") || "NONE",
  ).trim();
  const employerParticipationRateRaw = String(
    formData.get("employerParticipationRate") || "",
  ).trim();
  const employerExemptEarningsRaw = String(
    formData.get("employerExemptEarnings") || "",
  ).trim();
  const employerParticipationLimitRaw = String(
    formData.get("employerParticipationLimit") || "",
  ).trim();
  const earningCodeCode = String(formData.get("earningCodeCode") || "")
    .trim()
    .toUpperCase();

  if (!tenantId || !code || !description) return;
  if (!codePattern.test(code)) {
    throw new Error(
      "Code must be 2-10 characters and use only letters, numbers, hyphens, or underscores.",
    );
  }

  const validCategories: ContributoryCategory[] = [
    "HEALTH_INSURANCE",
    "RETIREMENT_PLAN",
    "IN_KIND_BENEFIT",
    "PURE_DEDUCTION",
  ];
  const validMethods: ContributoryMethod[] = [
    "FLAT_AMOUNT",
    "PERCENT_OF_GROSS",
    "PER_HOUR_WORKED",
    "NONE",
  ];
  const validDeductionMethods: ContributoryMethod[] = [
    "FLAT_AMOUNT",
    "PERCENT_OF_GROSS",
    "PER_HOUR_WORKED",
  ];

  if (!validCategories.includes(categoryRaw as ContributoryCategory)) return;
  if (
    !validDeductionMethods.includes(
      employeeDeductionMethodRaw as ContributoryMethod,
    )
  )
    return;
  if (
    !validMethods.includes(employerParticipationMethodRaw as ContributoryMethod)
  )
    return;

  const category = categoryRaw as ContributoryCategory;
  const employeeDeductionMethod =
    employeeDeductionMethodRaw as ContributoryMethod;
  const employerParticipationMethod =
    employerParticipationMethodRaw as ContributoryMethod;

  const employeeDeductionRate = parseDecimal(employeeDeductionRateRaw);
  if (employeeDeductionRate === null) return;

  const employeeExemptEarnings = parseDecimal(employeeExemptEarningsRaw) ?? 0;
  const employeeDeductionLimit = employeeDeductionLimitRaw
    ? parseDecimal(employeeDeductionLimitRaw)
    : null;
  const employeeDeductionAtSource = allowedAtSourceValues.has(
    employeeDeductionAtSourceRaw,
  )
    ? employeeDeductionAtSourceRaw
    : "POST_TAX";
  const employeeT4BoxNumber = employeeT4BoxRaw
    ? Number.parseInt(employeeT4BoxRaw, 10)
    : null;
  if (
    employeeT4BoxNumber !== null &&
    !allowedT4BoxValues.has(employeeT4BoxNumber)
  ) {
    return;
  }

  const employerParticipationRate =
    employerParticipationMethod !== "NONE" && employerParticipationRateRaw
      ? parseDecimal(employerParticipationRateRaw)
      : null;
  const employerExemptEarnings =
    employerParticipationMethod !== "NONE" && employerExemptEarningsRaw
      ? parseDecimal(employerExemptEarningsRaw)
      : null;
  const employerParticipationLimit =
    employerParticipationMethod !== "NONE" && employerParticipationLimitRaw
      ? parseDecimal(employerParticipationLimitRaw)
      : null;

  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, members: { some: { userId: session.userId } } },
    select: { id: true },
  });
  if (!tenant) return;

  const duplicate = await prisma.contributoryCode.findFirst({
    where: { tenantId, code },
    select: { id: true },
  });
  if (duplicate) {
    throw new Error(
      `Contributory code "${code}" already exists for this employer.`,
    );
  }

  let earningCodeId: string | null = null;
  if (earningCodeCode) {
    const earningCode = await prisma.earningCode.findFirst({
      where: { tenantId, code: earningCodeCode },
      select: { id: true },
    });
    earningCodeId = earningCode?.id ?? null;
  }

  await prisma.contributoryCode.create({
    data: {
      tenantId,
      code,
      category,
      description,
      employeeDeductionMethod,
      employeeDeductionRate,
      employeeExemptEarnings,
      employeeDeductionLimit,
      employeeDeductionAtSource,
      employeeT4BoxNumber: Number.isFinite(employeeT4BoxNumber)
        ? employeeT4BoxNumber
        : null,
      employerParticipationMethod,
      employerParticipationRate,
      employerExemptEarnings,
      employerParticipationLimit,
      earningCodeId,
    },
  });

  revalidatePath("/payroll/contributory-codes");
  revalidatePath(`/payroll/contributory-codes?tenantId=${tenantId}`);
}

async function updateContributoryCode(formData: FormData) {
  "use server";

  const session = await getSession();
  if (!session?.userId) return;

  const tenantId = String(formData.get("tenantId") || "").trim();
  const contributoryCodeId = String(
    formData.get("contributoryCodeId") || "",
  ).trim();
  const code = String(formData.get("code") || "")
    .trim()
    .toUpperCase();
  const categoryRaw = String(formData.get("category") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const employeeDeductionMethodRaw = String(
    formData.get("employeeDeductionMethod") || "",
  ).trim();
  const employeeDeductionRateRaw = String(
    formData.get("employeeDeductionRate") || "",
  ).trim();
  const employeeExemptEarningsRaw = String(
    formData.get("employeeExemptEarnings") || "0",
  ).trim();
  const employeeDeductionLimitRaw = String(
    formData.get("employeeDeductionLimit") || "",
  ).trim();
  const employeeDeductionAtSourceRaw = String(
    formData.get("employeeDeductionAtSource") || "POST_TAX",
  ).trim();
  const employeeT4BoxRaw = String(
    formData.get("employeeT4BoxNumber") || "",
  ).trim();
  const employerParticipationMethodRaw = String(
    formData.get("employerParticipationMethod") || "NONE",
  ).trim();
  const employerParticipationRateRaw = String(
    formData.get("employerParticipationRate") || "",
  ).trim();
  const employerExemptEarningsRaw = String(
    formData.get("employerExemptEarnings") || "",
  ).trim();
  const employerParticipationLimitRaw = String(
    formData.get("employerParticipationLimit") || "",
  ).trim();
  const earningCodeCode = String(formData.get("earningCodeCode") || "")
    .trim()
    .toUpperCase();

  if (!tenantId || !contributoryCodeId || !code || !description) return;
  if (!codePattern.test(code)) {
    throw new Error(
      "Code must be 2-10 characters and use only letters, numbers, hyphens, or underscores.",
    );
  }

  const validCategories: ContributoryCategory[] = [
    "HEALTH_INSURANCE",
    "RETIREMENT_PLAN",
    "IN_KIND_BENEFIT",
    "PURE_DEDUCTION",
  ];
  const validMethods: ContributoryMethod[] = [
    "FLAT_AMOUNT",
    "PERCENT_OF_GROSS",
    "PER_HOUR_WORKED",
    "NONE",
  ];
  const validDeductionMethods: ContributoryMethod[] = [
    "FLAT_AMOUNT",
    "PERCENT_OF_GROSS",
    "PER_HOUR_WORKED",
  ];

  if (!validCategories.includes(categoryRaw as ContributoryCategory)) return;
  if (
    !validDeductionMethods.includes(
      employeeDeductionMethodRaw as ContributoryMethod,
    )
  ) {
    return;
  }
  if (
    !validMethods.includes(employerParticipationMethodRaw as ContributoryMethod)
  ) {
    return;
  }

  const category = categoryRaw as ContributoryCategory;
  const employeeDeductionMethod =
    employeeDeductionMethodRaw as ContributoryMethod;
  const employerParticipationMethod =
    employerParticipationMethodRaw as ContributoryMethod;

  const employeeDeductionRate = parseDecimal(employeeDeductionRateRaw);
  if (employeeDeductionRate === null) return;

  const employeeExemptEarnings = parseDecimal(employeeExemptEarningsRaw) ?? 0;
  const employeeDeductionLimit = employeeDeductionLimitRaw
    ? parseDecimal(employeeDeductionLimitRaw)
    : null;
  const employeeDeductionAtSource = allowedAtSourceValues.has(
    employeeDeductionAtSourceRaw,
  )
    ? employeeDeductionAtSourceRaw
    : "POST_TAX";
  const employeeT4BoxNumber = employeeT4BoxRaw
    ? Number.parseInt(employeeT4BoxRaw, 10)
    : null;
  if (
    employeeT4BoxNumber !== null &&
    !allowedT4BoxValues.has(employeeT4BoxNumber)
  ) {
    return;
  }

  const employerParticipationRate =
    employerParticipationMethod !== "NONE" && employerParticipationRateRaw
      ? parseDecimal(employerParticipationRateRaw)
      : null;
  const employerExemptEarnings =
    employerParticipationMethod !== "NONE" && employerExemptEarningsRaw
      ? parseDecimal(employerExemptEarningsRaw)
      : null;
  const employerParticipationLimit =
    employerParticipationMethod !== "NONE" && employerParticipationLimitRaw
      ? parseDecimal(employerParticipationLimitRaw)
      : null;

  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, members: { some: { userId: session.userId } } },
    select: { id: true },
  });
  if (!tenant) return;

  const duplicate = await prisma.contributoryCode.findFirst({
    where: {
      tenantId,
      code,
      id: { not: contributoryCodeId },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new Error(
      `Contributory code "${code}" already exists for this employer.`,
    );
  }

  let earningCodeId: string | null = null;
  if (earningCodeCode) {
    const earningCode = await prisma.earningCode.findFirst({
      where: { tenantId, code: earningCodeCode },
      select: { id: true },
    });
    earningCodeId = earningCode?.id ?? null;
  }

  await prisma.contributoryCode.updateMany({
    where: {
      id: contributoryCodeId,
      tenantId,
    },
    data: {
      code,
      category,
      description,
      employeeDeductionMethod,
      employeeDeductionRate,
      employeeExemptEarnings,
      employeeDeductionLimit,
      employeeDeductionAtSource,
      employeeT4BoxNumber: Number.isFinite(employeeT4BoxNumber)
        ? employeeT4BoxNumber
        : null,
      employerParticipationMethod,
      employerParticipationRate,
      employerExemptEarnings,
      employerParticipationLimit,
      earningCodeId,
    },
  });

  revalidatePath("/payroll/contributory-codes");
  revalidatePath(`/payroll/contributory-codes?tenantId=${tenantId}`);
}

async function deactivateContributoryCode(formData: FormData) {
  "use server";

  const session = await getSession();
  if (!session?.userId) return;

  const tenantId = String(formData.get("tenantId") || "").trim();
  const contributoryCodeId = String(
    formData.get("contributoryCodeId") || "",
  ).trim();

  if (!tenantId || !contributoryCodeId) return;

  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, members: { some: { userId: session.userId } } },
    select: { id: true },
  });
  if (!tenant) return;

  await prisma.contributoryCode.updateMany({
    where: {
      id: contributoryCodeId,
      tenantId,
    },
    data: { isActive: false },
  });

  revalidatePath("/payroll/contributory-codes");
  revalidatePath(`/payroll/contributory-codes?tenantId=${tenantId}`);
}

async function deleteContributoryCode(formData: FormData) {
  "use server";

  const session = await getSession();
  if (!session?.userId) return;

  const tenantId = String(formData.get("tenantId") || "").trim();
  const contributoryCodeId = String(
    formData.get("contributoryCodeId") || "",
  ).trim();

  if (!tenantId || !contributoryCodeId) return;

  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, members: { some: { userId: session.userId } } },
    select: { id: true },
  });
  if (!tenant) return;

  await prisma.contributoryCode.deleteMany({
    where: {
      id: contributoryCodeId,
      tenantId,
    },
  });

  revalidatePath("/payroll/contributory-codes");
  revalidatePath(`/payroll/contributory-codes?tenantId=${tenantId}`);
}

export default async function ContributoryCodesPage({
  searchParams,
}: {
  searchParams: Promise<{
    tenantId?: string | string[];
    editId?: string | string[];
  }>;
}) {
  const { tenantId, editId } = await searchParams;
  const tenantIdValue = Array.isArray(tenantId) ? tenantId[0] : tenantId;
  const editIdValue = Array.isArray(editId) ? editId[0] : editId;
  const normalizedTenantId = (tenantIdValue || "").split("?")[0].trim();
  const normalizedEditId = (editIdValue || "").split("?")[0].trim();
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
          <h1 className="text-2xl font-semibold text-slate-900">
            Contributory codes
          </h1>
          <p className="mt-3 text-slate-600">
            No employer context is available. Choose an employer first.
          </p>
          <Link
            href="/tenants"
            className="mt-5 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Go to employers
          </Link>
        </section>
      </main>
    );
  }

  const employerName = getEmployerDisplayName(preferredTenant.nameCached);

  const defaultEarningCodes = DEFAULT_EARNING_CODES.map((def) => def.code);
  const earningCodes = await prisma.earningCode.findMany({
    where: {
      tenantId: preferredTenant.id,
      isActive: true,
      code: { notIn: defaultEarningCodes },
    },
    select: { id: true, code: true, description: true },
    orderBy: { code: "asc" },
  });

  const contributoryCodes = await prisma.contributoryCode.findMany({
    where: { tenantId: preferredTenant.id },
    select: {
      id: true,
      code: true,
      description: true,
      category: true,
      employeeDeductionMethod: true,
      employeeDeductionRate: true,
      employeeExemptEarnings: true,
      employeeDeductionLimit: true,
      employeeDeductionAtSource: true,
      employeeT4BoxNumber: true,
      employerParticipationMethod: true,
      employerParticipationRate: true,
      employerExemptEarnings: true,
      employerParticipationLimit: true,
      earningCode: {
        select: {
          code: true,
        },
      },
      isActive: true,
    },
    orderBy: [{ isActive: "desc" }, { code: "asc" }],
  });

  const contributoryCodeListItems = contributoryCodes.map(
    (contributoryCode) => ({
      id: contributoryCode.id,
      code: contributoryCode.code,
      description: contributoryCode.description,
      categoryLabel: getContributoryCategoryLabel(contributoryCode.category),
      employeeDeductionMethod: contributoryCode.employeeDeductionMethod,
      employeeDeductionRate: contributoryCode.employeeDeductionRate.toString(),
      employeeExcludedEarnings:
        contributoryCode.employeeExemptEarnings.toString(),
      employeeDeductionLimit:
        contributoryCode.employeeDeductionLimit?.toString() ?? null,
      employeeDeductionAtSource: contributoryCode.employeeDeductionAtSource,
      employeeT4BoxNumber: contributoryCode.employeeT4BoxNumber,
      employerParticipationMethod: contributoryCode.employerParticipationMethod,
      employerParticipationRate:
        contributoryCode.employerParticipationRate?.toString() ?? null,
      employerExcludedEarnings:
        contributoryCode.employerExemptEarnings?.toString() ?? null,
      employerParticipationLimit:
        contributoryCode.employerParticipationLimit?.toString() ?? null,
      earningCode: contributoryCode.earningCode?.code ?? null,
      isActive: contributoryCode.isActive,
    }),
  );

  const editingContributoryCode = normalizedEditId
    ? (contributoryCodes.find(
        (contributoryCode) => contributoryCode.id === normalizedEditId,
      ) ?? null)
    : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Contributory codes of {employerName} payroll
              </h1>
            </div>
            <Link
              href={`/payroll?tenantId=${preferredTenant.id}`}
              className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900"
            >
              Back to payroll overview
            </Link>
          </div>
        </header>

        <ContributoryCodeList
          tenantId={preferredTenant.id}
          contributoryCodes={contributoryCodeListItems}
          deactivateContributoryCode={deactivateContributoryCode}
          deleteContributoryCode={deleteContributoryCode}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            {editingContributoryCode
              ? "Edit a contributory code"
              : "Add a contributory code"}
          </h2>
          <form
            action={
              editingContributoryCode
                ? updateContributoryCode
                : saveContributoryCode
            }
          >
            <input type="hidden" name="tenantId" value={preferredTenant.id} />
            {editingContributoryCode ? (
              <input
                type="hidden"
                name="contributoryCodeId"
                value={editingContributoryCode.id}
              />
            ) : null}
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Code
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="e.g. HLTH"
                  defaultValue={editingContributoryCode?.code}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  <Clarification
                    term="Category"
                    description={CATEGORY_CLARIFICATION}
                  />
                </label>
                <select
                  name="category"
                  defaultValue={editingContributoryCode?.category}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  {CONTRIBUTORY_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  placeholder="e.g. Sunlife life insurance"
                  defaultValue={editingContributoryCode?.description}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <EmployeeDeductionFields
                  employeeDeductionOptions={EMPLOYEE_DEDUCTION_VALUE_OPTIONS}
                  rateAmountClarification={RATE_AMOUNT_CLARIFICATION}
                  deductionExcludedEarningsClarification={
                    DEDUCTION_EXCLUDED_EARNINGS_CLARIFICATION
                  }
                  deductionLimitClarification={DEDUCTION_LIMIT_CLARIFICATION}
                  initialMethod={
                    editingContributoryCode?.employeeDeductionMethod
                  }
                  initialRate={editingContributoryCode?.employeeDeductionRate.toString()}
                  initialExcludedEarnings={editingContributoryCode?.employeeExemptEarnings.toString()}
                  initialLimit={
                    editingContributoryCode?.employeeDeductionLimit?.toString() ??
                    ""
                  }
                  initialAtSource={
                    editingContributoryCode?.employeeDeductionAtSource
                  }
                  initialT4BoxNumber={
                    editingContributoryCode?.employeeT4BoxNumber?.toString() ??
                    ""
                  }
                />
              </div>
              <div className="md:col-span-2">
                <EmployerParticipationFields
                  employerParticipationOptions={CONTRIBUTORY_VALUE_OPTIONS}
                  rateAmountClarification={RATE_AMOUNT_CLARIFICATION}
                  participationExcludedEarningsClarification={
                    PARTICIPATION_EXCLUDED_EARNINGS_CLARIFICATION
                  }
                  participationLimitClarification={
                    PARTICIPATION_LIMIT_CLARIFICATION
                  }
                  earningCodeTerm={contributoryCodeContent.earningCode.term}
                  earningCodeDescription={
                    contributoryCodeContent.earningCode.description
                  }
                  earningCodeOptions={earningCodes}
                  initialMethod={
                    editingContributoryCode?.employerParticipationMethod
                  }
                  initialRate={
                    editingContributoryCode?.employerParticipationRate?.toString() ??
                    ""
                  }
                  initialExcludedEarnings={
                    editingContributoryCode?.employerExemptEarnings?.toString() ??
                    ""
                  }
                  initialLimit={
                    editingContributoryCode?.employerParticipationLimit?.toString() ??
                    ""
                  }
                  initialEarningCodeCode={
                    editingContributoryCode?.earningCode?.code ?? ""
                  }
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Save
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
