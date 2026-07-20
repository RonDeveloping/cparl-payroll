// app/payroll/earning-type/page.tsx
import Link from "next/link";
import { EarningType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/db/prismaDrizzle";
import { getSession } from "@/lib/session";
import { getUserTenants } from "@/lib/dal/tenant";
import { getEarningCodeDescription } from "@/lib/earning-code-display";
import {
  EARNING_TYPE_OPTIONS,
  DEFAULT_EARNING_CODES,
  isEarningTypeValue,
} from "@/constants/earning-types";
import {
  evaluateEarningTypePolicy,
  getDefaultsByEarningType,
  isCustomizedFromStandard,
  normalizePolicyMode,
  type EarningCodeFlags,
  type EarningCodePolicyMode,
} from "@/constants/earning-code-policy";
import EarningCodeList from "@/app/payroll/earning-type/earning-code-list";
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
const protectedEarningCodeCodes = DEFAULT_EARNING_CODES.map(
  (definition) => definition.code,
);
const t4DetailBoxEarningTypes: readonly EarningType[] = [
  "COMMISSION",
  "TAXABLE_BENEFIT",
  "REASONABLE_ALLOWANCE",
  "OTHER",
];
const earningCodePattern = /^[A-Z0-9][A-Z0-9_-]{1,9}$/;

function isProtectedEarningCode(code: string) {
  return protectedEarningCodeCodes.includes(
    code as (typeof protectedEarningCodeCodes)[number],
  );
}

function canUseT4DetailBox(earningType: EarningType) {
  return t4DetailBoxEarningTypes.includes(earningType);
}

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
  const isSubjectToCPP = formData.get("isSubjectToCPP") === "on";
  const isSubjectToEI = formData.get("isSubjectToEI") === "on";
  const t4BoxRaw = String(formData.get("t4BoxNumber") || "").trim();
  const overrideReason = String(formData.get("overrideReason") || "").trim();

  if (!tenantId || !code || !description) return;
  if (!isEarningTypeValue(earningTypeRaw)) return;
  if (!earningCodePattern.test(code)) {
    throw new Error(
      "Earning code must be 2-10 characters and use only letters, numbers, hyphens, or underscores.",
    );
  }

  const earningType = earningTypeRaw as EarningType;
  const flags: EarningCodeFlags = {
    isHourly,
    isTaxable,
    isSubjectToCPP,
    isSubjectToEI,
  };

  const tenant = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
      members: {
        some: { userId: session.userId },
      },
    },
    select: {
      id: true,
      settings: {
        select: {
          timezone: true,
        },
      },
      members: {
        where: { userId: session.userId },
        select: { role: true },
        take: 1,
      },
    },
  });

  if (!tenant) return;

  const duplicateEarningCode = await prisma.earningCode.findFirst({
    where: {
      tenantId,
      code,
    },
    select: { id: true },
  });

  if (duplicateEarningCode) {
    throw new Error("This earning code already exists for this employer.");
  }

  const policyMode = resolveTenantPolicyMode(tenant);
  const userRole = tenant.members[0]?.role ?? null;
  const canCustomizeInGuarded = userRole === "OWNER" || userRole === "ADMIN";
  const defaults = getDefaultsByEarningType(earningTypeRaw);
  const isCustomized = isCustomizedFromStandard(earningTypeRaw, flags);
  const hardStopIssues = evaluateEarningTypePolicy(
    earningTypeRaw,
    flags,
  ).filter((issue) => issue.severity === "hard-stop");

  if (policyMode === "STRICT") {
    const strictViolation =
      flags.isHourly !== defaults.isHourly ||
      flags.isTaxable !== defaults.isTaxable ||
      flags.isSubjectToCPP !== defaults.isSubjectToCPP ||
      flags.isSubjectToEI !== defaults.isSubjectToEI;

    if (strictViolation) {
      throw new Error(
        "Tenant policy is STRICT. Earning code flags must match the standard defaults for the selected earning type.",
      );
    }
  }

  if (policyMode === "GUARDED" && isCustomized) {
    if (!canCustomizeInGuarded) {
      throw new Error(
        "Tenant policy is GUARDED. Only OWNER or ADMIN can customize earning code flags.",
      );
    }

    if (!overrideReason) {
      throw new Error(
        "Tenant policy is GUARDED. An override reason is required when flags differ from the standard.",
      );
    }
  }

  if (hardStopIssues.length > 0) {
    throw new Error(hardStopIssues.map((issue) => issue.message).join(" "));
  }

  const parsedT4BoxNumber = t4BoxRaw ? Number.parseInt(t4BoxRaw, 10) : null;
  const t4BoxNumber =
    canUseT4DetailBox(earningType) && Number.isFinite(parsedT4BoxNumber)
      ? parsedT4BoxNumber
      : null;

  await prisma.earningCode.create({
    data: {
      tenantId,
      code,
      description,
      earningType,
      isHourly,
      isTaxable,
      isSubjectToCPP,
      isSubjectToEI,
      overrideReason: isCustomized ? overrideReason || null : null,
      t4BoxNumber,
    },
  });

  revalidatePath("/payroll/earning-type");
  revalidatePath(`/payroll/earning-type?tenantId=${tenantId}`);
}

async function updateEarningCode(formData: FormData) {
  "use server";

  const session = await getSession();
  if (!session?.userId) return;

  const tenantId = String(formData.get("tenantId") || "").trim();
  const earningCodeId = String(formData.get("earningCodeId") || "").trim();
  const code = String(formData.get("code") || "")
    .trim()
    .toUpperCase();
  const description = String(formData.get("description") || "").trim();
  const earningTypeRaw = String(formData.get("earningType") || "");
  const isHourly = formData.get("isHourly") === "on";
  const isTaxable = formData.get("isTaxable") === "on";
  const isSubjectToCPP = formData.get("isSubjectToCPP") === "on";
  const isSubjectToEI = formData.get("isSubjectToEI") === "on";
  const t4BoxRaw = String(formData.get("t4BoxNumber") || "").trim();
  const overrideReason = String(formData.get("overrideReason") || "").trim();

  if (!tenantId || !earningCodeId || !code || !description) return;
  if (!isEarningTypeValue(earningTypeRaw)) return;
  if (!earningCodePattern.test(code)) {
    throw new Error(
      "Earning code must be 2-10 characters and use only letters, numbers, hyphens, or underscores.",
    );
  }

  const tenant = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
      members: {
        some: { userId: session.userId },
      },
    },
    select: {
      id: true,
      settings: {
        select: {
          timezone: true,
        },
      },
      members: {
        where: { userId: session.userId },
        select: { role: true },
        take: 1,
      },
    },
  });

  if (!tenant) return;

  const currentEarningCode = await prisma.earningCode.findFirst({
    where: { id: earningCodeId, tenantId },
    select: { code: true },
  });

  if (!currentEarningCode || isProtectedEarningCode(currentEarningCode.code)) {
    return;
  }

  const duplicateEarningCode = await prisma.earningCode.findFirst({
    where: {
      tenantId,
      code,
      id: { not: earningCodeId },
    },
    select: { id: true },
  });

  if (duplicateEarningCode) {
    throw new Error("This earning code already exists for this employer.");
  }

  const flags: EarningCodeFlags = {
    isHourly,
    isTaxable,
    isSubjectToCPP,
    isSubjectToEI,
  };
  const policyMode = resolveTenantPolicyMode(tenant);
  const userRole = tenant.members[0]?.role ?? null;
  const canCustomizeInGuarded = userRole === "OWNER" || userRole === "ADMIN";
  const defaults = getDefaultsByEarningType(earningTypeRaw);
  const isCustomized = isCustomizedFromStandard(earningTypeRaw, flags);
  const hardStopIssues = evaluateEarningTypePolicy(
    earningTypeRaw,
    flags,
  ).filter((issue) => issue.severity === "hard-stop");

  if (policyMode === "STRICT") {
    const strictViolation =
      flags.isHourly !== defaults.isHourly ||
      flags.isTaxable !== defaults.isTaxable ||
      flags.isSubjectToCPP !== defaults.isSubjectToCPP ||
      flags.isSubjectToEI !== defaults.isSubjectToEI;

    if (strictViolation) {
      throw new Error(
        "Tenant policy is STRICT. Earning code flags must match the standard defaults for the selected earning type.",
      );
    }
  }

  if (policyMode === "GUARDED" && isCustomized) {
    if (!canCustomizeInGuarded) {
      throw new Error(
        "Tenant policy is GUARDED. Only OWNER or ADMIN can customize earning code flags.",
      );
    }

    if (!overrideReason) {
      throw new Error(
        "Tenant policy is GUARDED. An override reason is required when flags differ from the standard.",
      );
    }
  }

  if (hardStopIssues.length > 0) {
    throw new Error(hardStopIssues.map((issue) => issue.message).join(" "));
  }

  const earningType = earningTypeRaw as EarningType;
  const parsedT4BoxNumber = t4BoxRaw ? Number.parseInt(t4BoxRaw, 10) : null;
  const t4BoxNumber =
    canUseT4DetailBox(earningType) && Number.isFinite(parsedT4BoxNumber)
      ? parsedT4BoxNumber
      : null;

  await prisma.earningCode.updateMany({
    where: {
      id: earningCodeId,
      tenantId,
      code: { notIn: [...protectedEarningCodeCodes] },
    },
    data: {
      code,
      description,
      earningType,
      isHourly,
      isTaxable,
      isSubjectToCPP,
      isSubjectToEI,
      overrideReason: isCustomized ? overrideReason || null : null,
      t4BoxNumber,
    },
  });

  revalidatePath("/payroll/earning-type");
  revalidatePath(`/payroll/earning-type?tenantId=${tenantId}`);
  redirect(`/payroll/earning-type?tenantId=${tenantId}`);
}

function resolveTenantPolicyMode(tenant: {
  settings: { timezone: string } | null;
}): EarningCodePolicyMode {
  const settingsWithPolicy = tenant.settings as
    | ({ earningCodePolicyMode?: unknown } & { timezone: string })
    | null;

  return normalizePolicyMode(settingsWithPolicy?.earningCodePolicyMode);
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
      code: { notIn: [...protectedEarningCodeCodes] },
    },
  });

  revalidatePath("/payroll/earning-type");
  revalidatePath(`/payroll/earning-type?tenantId=${tenantId}`);
}

async function deactivateEarningCode(formData: FormData) {
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

  await prisma.earningCode.updateMany({
    where: {
      id: earningCodeId,
      tenantId,
      code: { notIn: [...protectedEarningCodeCodes] },
    },
    data: { isActive: false },
  });

  revalidatePath("/payroll/earning-type");
  revalidatePath(`/payroll/earning-type?tenantId=${tenantId}`);
}

export default async function EarningTypePage({
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
            Earning Codes
          </h1>
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
  const session = await getSession();
  const currentMemberRole = preferredTenant.members.find(
    (member) => member.userId === session?.userId,
  )?.role;
  const policyMode = resolveTenantPolicyMode(preferredTenant);
  const canCustomizeFlags =
    policyMode === "FLEXIBLE" ||
    (policyMode === "GUARDED" &&
      (currentMemberRole === "OWNER" || currentMemberRole === "ADMIN"));
  const earningCodes = await prisma.earningCode.findMany({
    where: { tenantId: preferredTenant.id },
    orderBy: [{ isActive: "desc" }, { code: "asc" }],
  });
  const earningCodeListItems = earningCodes.map((earningCode) => ({
    id: earningCode.id,
    code: earningCode.code,
    description: earningCode.description,
    displayDescription: getEarningCodeDescription(earningCode),
    earningType: earningCode.earningType,
    isHourly: earningCode.isHourly,
    isTaxable: earningCode.isTaxable,
    isSubjectToCPP: earningCode.isSubjectToCPP,
    isSubjectToEI: earningCode.isSubjectToEI,
    isActive: earningCode.isActive,
    isProtectedCode: isProtectedEarningCode(earningCode.code),
    t4BoxNumber: earningCode.t4BoxNumber,
  }));
  const editingEarningCode = normalizedEditId
    ? (earningCodes.find(
        (earningCode) =>
          earningCode.id === normalizedEditId &&
          !isProtectedEarningCode(earningCode.code),
      ) ?? null)
    : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Earning Codes of {employerName} Payroll
              </h1>
            </div>
            <Link
              href={`/payroll?tenantId=${preferredTenant.id}`}
              className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900"
            >
              Back to Payroll Overview
            </Link>
          </div>
        </header>

        <EarningCodeList
          tenantId={preferredTenant.id}
          earningCodes={earningCodeListItems}
          deactivateEarningCode={deactivateEarningCode}
          deleteEarningCode={deleteEarningCode}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            {editingEarningCode
              ? "Edit an Earning Code"
              : "Add an Earning Code"}
          </h2>
          <EarningCodeForm
            key={editingEarningCode?.id ?? "new"}
            tenantId={preferredTenant.id}
            earningCodeId={editingEarningCode?.id}
            policyMode={policyMode}
            canCustomizeFlags={canCustomizeFlags}
            existingCodes={earningCodes.map((earningCode) => earningCode.code)}
            saveEarningCode={
              editingEarningCode ? updateEarningCode : addEarningCode
            }
            earningTypeOptions={earningTypeOptions}
            initialValue={
              editingEarningCode
                ? {
                    code: editingEarningCode.code,
                    description: editingEarningCode.description,
                    earningType: editingEarningCode.earningType,
                    isHourly: editingEarningCode.isHourly,
                    isTaxable: editingEarningCode.isTaxable,
                    isSubjectToCPP: editingEarningCode.isSubjectToCPP,
                    isSubjectToEI: editingEarningCode.isSubjectToEI,
                    overrideReason: editingEarningCode.overrideReason,
                    t4BoxNumber: editingEarningCode.t4BoxNumber,
                  }
                : undefined
            }
          />
        </section>
      </div>
    </main>
  );
}
