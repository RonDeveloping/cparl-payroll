import type { TenantFormInput } from "@/lib/validations/tenant-schema";

function toComparableDay(day: number): number {
  return day < 0 ? 32 + day : day;
}

const WEEKDAY_INDEX: Record<
  NonNullable<TenantFormInput["payWeekday"]>,
  number
> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

export function computeTimingDaysFromTenantInput(
  data: Pick<
    TenantFormInput,
    | "payFrequency"
    | "periodEndDay"
    | "periodEndWeekday"
    | "boundaryShift"
    | "payWeekday"
    | "payday"
    | "payday2"
    | "periodEndDay2"
  >,
): number | null {
  const frequency = (data.payFrequency || "").toUpperCase();

  if (frequency === "WEEKLY" || frequency === "BIWEEKLY") {
    if (!data.periodEndWeekday || !data.payWeekday) {
      return null;
    }

    const periodEndWeekdayIndex = WEEKDAY_INDEX[data.periodEndWeekday];
    const paydayWeekdayIndex = WEEKDAY_INDEX[data.payWeekday];
    const boundaryShift = data.boundaryShift ?? 0;

    return periodEndWeekdayIndex + boundaryShift * 7 - paydayWeekdayIndex;
  }

  if (frequency === "SEMIMONTHLY") {
    const periodEndDay = data.periodEndDay ?? data.periodEndDay2;
    const payday = data.payday ?? data.payday2;

    if (periodEndDay == null || payday == null) {
      return null;
    }

    return toComparableDay(periodEndDay) - toComparableDay(payday);
  }

  if (frequency === "MONTHLY") {
    if (data.periodEndDay == null || data.payday == null) {
      return null;
    }

    const boundaryShift = data.boundaryShift ?? 0;

    return (
      toComparableDay(data.periodEndDay) +
      boundaryShift * 31 -
      toComparableDay(data.payday)
    );
  }

  return null;
}
