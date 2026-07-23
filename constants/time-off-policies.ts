export const TIME_OFF_ROWS = [
  { policy: "Vacation", accrualRateName: "vacationTimeOff" as const },
  { policy: "Sick", accrualRateName: "sickTimeOff" as const },
  { policy: "Unpaid", accrualRateName: "personalTimeOff" as const },
] as const;

export type TimeOffAccrualRateName =
  (typeof TIME_OFF_ROWS)[number]["accrualRateName"];

export type TimeOffRecord = Record<TimeOffAccrualRateName, string>;

export type TimeOffBenchmarkDraft = {
  accrualRate: TimeOffRecord;
  frequency: TimeOffRecord;
  annualAllowance: TimeOffRecord;
  hourCap: TimeOffRecord;
};

export const ACCRUAL_FREQUENCY_OPTIONS = [
  "Per hour worked",
  "Each pay period",
  "Beginning of year",
  "Anniversary date",
] as const;

export const VACATION_POLICY_CLARIFICATION =
  "If vacation is to be paid out each pay, please choose Per hour worked and input Accrual rate % e.g. 4, then keep Annual allowance as blank or input zero.";

export const HOUR_CAP_CLARIFICATION =
  "Hour cap is the maximum allowed at any time, so it must be no less than Annual allowance.";

export const ACCRUAL_RATE_CLARIFICATION =
  "Input hours/period x 100 when the frequency is set to Each pay period.";

export const parseOptionalTimeOffNumber = (value: string) => {
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) {
    return null;
  }

  const numeric = Number.parseFloat(normalized);
  return Number.isFinite(numeric) ? numeric : null;
};

export function createEmptyTimeOffRecord(): TimeOffRecord {
  return TIME_OFF_ROWS.reduce((record, row) => {
    record[row.accrualRateName] = "";
    return record;
  }, {} as TimeOffRecord);
}

export function createEmptyTimeOffBenchmarkDraft(): TimeOffBenchmarkDraft {
  return {
    accrualRate: createEmptyTimeOffRecord(),
    frequency: createEmptyTimeOffRecord(),
    annualAllowance: createEmptyTimeOffRecord(),
    hourCap: createEmptyTimeOffRecord(),
  };
}

export function normalizeTimeOffBenchmarkDraft(
  input: Partial<TimeOffBenchmarkDraft> | null | undefined,
): TimeOffBenchmarkDraft {
  const normalized = createEmptyTimeOffBenchmarkDraft();
  if (!input) return normalized;

  for (const row of TIME_OFF_ROWS) {
    const key = row.accrualRateName;
    normalized.accrualRate[key] = input.accrualRate?.[key] || "";
    normalized.frequency[key] = input.frequency?.[key] || "";
    normalized.annualAllowance[key] = input.annualAllowance?.[key] || "";
    normalized.hourCap[key] = input.hourCap?.[key] || "";
  }

  return normalized;
}
