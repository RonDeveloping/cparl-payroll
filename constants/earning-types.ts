export const EARNING_TYPE_OPTIONS = [
  "REGULAR",
  "OVERTIME",
  "SICK",
  "HOLIDAY",
  "VACATION",
  "BONUS",
  "COMMISSION",
  "TAXABLE_BENEFIT",
  "REASONABLE_ALLOWANCE",
  "OTHER",
] as const;

export type EarningTypeValue = (typeof EARNING_TYPE_OPTIONS)[number];

export function isEarningTypeValue(value: string): value is EarningTypeValue {
  return (EARNING_TYPE_OPTIONS as readonly string[]).includes(value);
}
