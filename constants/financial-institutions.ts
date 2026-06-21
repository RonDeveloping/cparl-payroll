import institutionsData from "@/constants/financial-institutions.data.json";

export type FinancialInstitution = {
  shortName: string;
  displayName: string;
  badgeClass: string;
};

// Source of truth is the JSON data file so updates can be scripted.
const FINANCIAL_INSTITUTIONS = institutionsData as Record<
  string,
  FinancialInstitution
>;

export function normalizeInstitutionCode(
  value: string | number | null | undefined,
): string {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 3)
    .padStart(3, "0");
}

export function getInstitutionShortName(
  value: string | number | null | undefined,
): string | null {
  const code = normalizeInstitutionCode(value);
  return FINANCIAL_INSTITUTIONS[code]?.shortName ?? null;
}

export function getInstitutionDisplayName(
  value: string | number | null | undefined,
): string | null {
  const code = normalizeInstitutionCode(value);
  return FINANCIAL_INSTITUTIONS[code]?.displayName ?? null;
}

export function getInstitutionBadgeClass(
  value: string | number | null | undefined,
): string {
  const code = normalizeInstitutionCode(value);
  return FINANCIAL_INSTITUTIONS[code]?.badgeClass ?? "text-slate-600";
}

export function isValidInstitutionCode(
  value: string | number | null | undefined,
): boolean {
  const code = normalizeInstitutionCode(value);
  return code.length === 3 && Boolean(FINANCIAL_INSTITUTIONS[code]);
}
