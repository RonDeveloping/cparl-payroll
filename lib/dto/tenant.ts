// lib/dto/tenant.ts

/**
 * Tenant DTO (Data Transfer Object) helpers for presentation-ready data by carrying data between layers of DB & UI/API without embedding business logic.
 *
 * This module converts tenant rows into UI-friendly summaries
 * (display names, business number formatting, and payroll text).
 */
import formatBusinessNumber, {
  composeBusinessNumberFromParts,
} from "@/utils/formatters/businessNumber";
import { computeTimingDaysFromTenantInput } from "@/lib/utils/timing-days";
import type { TenantFormInput } from "@/lib/validations/tenant-schema";

export type TenantNameCached = {
  coreName: string;
  kindName?: string | null;
  aliasName?: string | null;
};

export type TenantSummaryDto = {
  id: string;
  nameCached: TenantNameCached;
  slug: string;
  businessBn9: string | null;
  businessProgramId: string | null;
  programRefNum: string | null;
  isActive: boolean;
  createdAt: string;
  displayName: string;
  operatingAsName: string;
  displayBusinessNumber: string | null;
  displayBusinessBn9: string | null;
  postalCode: string | null;
  payrollFrequency: string | null;
  payPeriodEnd: string | null;
  paydaySummary: string | null;
  timingDays: number | null;
};

type TenantPayScheduleSummary = {
  frequency: string;
  timingDays: number;
  payday: number | null;
  payday2: number | null;
  periodEndDay: number;
  payWeekday: string | null;
  periodEndWeekday: string | null;
  boundaryShift: number;
  periodEndDay2: number | null;
  boundaryShift2: number | null;
};

type TenantRow = {
  id: string;
  nameCached: unknown;
  slug: string;
  businessBn9: string | null;
  businessProgramId: string | null;
  programRefNum: string | null;
  isActive: boolean;
  createdAt: Date;
  postalCode: string | null;
  paySchedule: TenantPayScheduleSummary | null;
};

function titleCase(value: string): string {
  const lower = value.trim().toLowerCase();
  if (!lower) return "";
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function formatPayrollFrequency(frequency: string | null): string | null {
  switch ((frequency || "").toUpperCase()) {
    case "MONTHLY":
      return "Monthly";
    case "SEMIMONTHLY":
      return "Semi-monthly";
    case "BIWEEKLY":
      return "Biweekly";
    case "WEEKLY":
      return "Weekly";
    default:
      return null;
  }
}

function formatPeriodEndDay(day: number | null): string {
  if (day == null) return "Not set";
  if (day === -1) return "Last day of month";
  if (day === -2) return "2nd-to-last day of month";
  if (day === -3) return "3rd-to-last day of month";
  return `Day ${day}`;
}

function formatRelativeWeek(shift: number | null): string {
  if (shift === -1) return "prior week";
  if (shift === 0) return "same week";
  if (shift === 1) return "next week";
  if (typeof shift === "number") {
    return `${shift > 0 ? `+${shift}` : shift} weeks`;
  }
  return "same week";
}

function formatPayPeriodEnd(
  paySchedule: TenantPayScheduleSummary | null,
): string | null {
  if (!paySchedule) return null;

  const frequency = (paySchedule.frequency || "").toUpperCase();

  if (frequency === "WEEKLY" || frequency === "BIWEEKLY") {
    if (!paySchedule.periodEndWeekday) return null;
    const weekday = titleCase(paySchedule.periodEndWeekday);
    return `${weekday} (${formatRelativeWeek(paySchedule.boundaryShift)})`;
  }

  if (frequency === "SEMIMONTHLY") {
    const first = formatPeriodEndDay(paySchedule.periodEndDay);
    const second = formatPeriodEndDay(paySchedule.periodEndDay2);
    return `${first} / ${second}`;
  }

  return formatPeriodEndDay(paySchedule.periodEndDay);
}

function formatPaydaySummary(
  paySchedule: TenantPayScheduleSummary | null,
): string | null {
  if (!paySchedule) return null;

  const frequency = (paySchedule.frequency || "").toUpperCase();

  if (frequency === "WEEKLY" || frequency === "BIWEEKLY") {
    return paySchedule.payWeekday ? titleCase(paySchedule.payWeekday) : null;
  }

  if (frequency === "MONTHLY") {
    return formatPeriodEndDay(paySchedule.payday);
  }

  if (frequency !== "SEMIMONTHLY") return null;

  const first = formatPeriodEndDay(paySchedule.payday);
  const second = formatPeriodEndDay(paySchedule.payday2);
  return `${first} / ${second}`;
}

function normalizeNameForComparison(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function coerceTenantNameCached(input: unknown): TenantNameCached {
  if (typeof input !== "object" || input === null) {
    return { coreName: "Employer" };
  }

  const value = input as Record<string, unknown>;
  const coreName =
    typeof value.coreName === "string" && value.coreName.trim().length > 0
      ? value.coreName
      : "Employer";

  return {
    coreName,
    kindName: typeof value.kindName === "string" ? value.kindName : null,
    aliasName: typeof value.aliasName === "string" ? value.aliasName : null,
  };
}

export function toTenantSummaryDto(tenant: TenantRow): TenantSummaryDto {
  const nameCached = coerceTenantNameCached(tenant.nameCached);
  const legalName = `${nameCached.coreName}${
    nameCached.kindName ? ` ${nameCached.kindName}` : ""
  }`;
  const aliasName = nameCached.aliasName?.trim() || "";
  const normalizedAliasName = normalizeNameForComparison(aliasName);
  const shouldShowOperatingAs =
    aliasName.length > 0 &&
    normalizedAliasName !== normalizeNameForComparison(legalName) &&
    normalizedAliasName !== normalizeNameForComparison(nameCached.coreName);
  const displayName = `${legalName}${
    shouldShowOperatingAs ? ` (o/a ${aliasName})` : ""
  }`;
  const operatingAsName =
    nameCached.aliasName?.trim() || nameCached.coreName || "Employer";
  const displayBusinessNumber =
    formatBusinessNumber(
      composeBusinessNumberFromParts({
        bn9: tenant.businessBn9,
        programId: tenant.businessProgramId,
        accountRef: tenant.programRefNum,
      }) ?? "",
    ) || null;
  const displayBusinessBn9 = (tenant.businessBn9 || "")
    .replace(/\D/g, "")
    .slice(0, 9);
  const payrollFrequency = formatPayrollFrequency(
    tenant.paySchedule?.frequency ?? null,
  );
  const payPeriodEnd = formatPayPeriodEnd(tenant.paySchedule);
  const paydaySummary = formatPaydaySummary(tenant.paySchedule);
  const computedTimingDays = tenant.paySchedule
    ? computeTimingDaysFromTenantInput({
        payFrequency: tenant.paySchedule
          .frequency as TenantFormInput["payFrequency"],
        periodEndDay: tenant.paySchedule.periodEndDay,
        periodEndWeekday: tenant.paySchedule
          .periodEndWeekday as TenantFormInput["periodEndWeekday"],
        boundaryShift: tenant.paySchedule.boundaryShift,
        payWeekday: tenant.paySchedule
          .payWeekday as TenantFormInput["payWeekday"],
        payday: tenant.paySchedule.payday,
        payday2: tenant.paySchedule.payday2,
        periodEndDay2: tenant.paySchedule.periodEndDay2,
      })
    : null;

  return {
    id: tenant.id,
    nameCached,
    slug: tenant.slug,
    businessBn9: tenant.businessBn9,
    businessProgramId: tenant.businessProgramId,
    programRefNum: tenant.programRefNum,
    isActive: tenant.isActive,
    createdAt: tenant.createdAt.toISOString(),
    displayName,
    operatingAsName,
    displayBusinessNumber,
    displayBusinessBn9: displayBusinessBn9 || null,
    postalCode: tenant.postalCode,
    payrollFrequency,
    payPeriodEnd,
    paydaySummary,
    timingDays: computedTimingDays ?? tenant.paySchedule?.timingDays ?? null,
  };
}
