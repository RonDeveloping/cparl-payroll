import { earningCodeContent } from "@/constants/content";

export const EARNING_TYPE_OPTIONS = [
  "REGULAR",
  "OVERTIME",
  "SICK",
  "HOLIDAY",
  "VACATION",
  "BONUS",
  "COMMISSION",
  "IN_KIND",
  "PER_DIEM",
  "OTHER",
] as const;

export type EarningTypeValue = (typeof EARNING_TYPE_OPTIONS)[number];

export const DEFAULT_EARNING_CODES = [
  {
    code: "SAL",
    description: earningCodeContent.SAL.description,
    earningType: "REGULAR",
    isHourly: false,
    isTaxable: true,
    isSubjectToCPP: true,
    isSubjectToEI: true,
  },
  {
    code: "REG",
    description: earningCodeContent.REG.description,
    earningType: "REGULAR",
    isHourly: true,
    isTaxable: true,
    isSubjectToCPP: true,
    isSubjectToEI: true,
  },
  {
    code: "BEN",
    description: earningCodeContent.BEN.description,
    earningType: "IN_KIND",
    isHourly: false,
    isTaxable: true,
    isSubjectToCPP: true,
    isSubjectToEI: false,
  },
] as const;

export function isEarningTypeValue(value: string): value is EarningTypeValue {
  return (EARNING_TYPE_OPTIONS as readonly string[]).includes(value);
}
