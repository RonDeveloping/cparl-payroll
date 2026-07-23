"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import FormSection from "@/components/form/form-section";
import { Clarification } from "@/components/clarification";
import { cn } from "@/lib/utils";
import {
  ACCRUAL_FREQUENCY_OPTIONS,
  ACCRUAL_RATE_CLARIFICATION,
  createEmptyTimeOffBenchmarkDraft,
  HOUR_CAP_CLARIFICATION,
  normalizeTimeOffBenchmarkDraft,
  parseOptionalTimeOffNumber,
  TIME_OFF_ROWS,
  type TimeOffBenchmarkDraft,
  VACATION_POLICY_CLARIFICATION,
} from "@/constants/time-off-policies";

type TimeOffValidationError = {
  accrualRate?: string;
  annualAllowance?: string;
  hourCap?: string;
};

function getRowValidationErrors(
  row: (typeof TIME_OFF_ROWS)[number],
  draft: TimeOffBenchmarkDraft,
): TimeOffValidationError {
  const accrualRateValue = draft.accrualRate[row.accrualRateName].trim();
  const frequencyValue = draft.frequency[row.accrualRateName];
  const annualAllowanceRaw = draft.annualAllowance[row.accrualRateName] || "";
  const hourCapRaw = draft.hourCap[row.accrualRateName] || "";

  const annualAllowanceValue = parseOptionalTimeOffNumber(annualAllowanceRaw);
  const hourCapValue = parseOptionalTimeOffNumber(hourCapRaw);
  const hasNonZeroAnnualAllowance =
    annualAllowanceValue !== null && annualAllowanceValue !== 0;

  const isVacation = row.accrualRateName === "vacationTimeOff";
  const isPerHourWorked = frequencyValue === "Per hour worked";

  const accrualRateError =
    isVacation && isPerHourWorked && !accrualRateValue
      ? "Accrual rate is required when frequency is Per hour worked."
      : undefined;

  const annualAllowanceError = annualAllowanceRaw.trim()
    ? annualAllowanceValue === null
      ? "Annual allowance must be a valid number."
      : isVacation && isPerHourWorked && annualAllowanceValue !== 0
        ? "For Vacation with Per hour worked, Annual allowance must be blank or 0."
        : undefined
    : undefined;

  const hourCapError = hourCapRaw.trim()
    ? hourCapValue === null
      ? "Hour cap must be a valid number."
      : hasNonZeroAnnualAllowance && hourCapValue < annualAllowanceValue
        ? "Hour cap must be no less than Annual allowance."
        : isVacation && isPerHourWorked && hourCapValue !== 0
          ? "For Vacation with Per hour worked, Hour cap must be blank or 0."
          : undefined
    : hasNonZeroAnnualAllowance
      ? "Hour cap is required when Annual allowance is non-zero."
      : undefined;

  return {
    accrualRate: accrualRateError,
    annualAllowance: annualAllowanceError,
    hourCap: hourCapError,
  };
}

export default function TimeOffPoliciesForm({
  tenantId,
  initialDraft,
  saveTimeOffBenchmarkPolicies,
}: {
  tenantId: string;
  initialDraft: TimeOffBenchmarkDraft;
  saveTimeOffBenchmarkPolicies: (formData: FormData) => Promise<void>;
}) {
  const [draft, setDraft] = useState<TimeOffBenchmarkDraft>(() =>
    normalizeTimeOffBenchmarkDraft(initialDraft),
  );
  const [shouldRunValidation, setShouldRunValidation] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();

  const handleSave = () => {
    setShouldRunValidation(true);

    const hasErrors = TIME_OFF_ROWS.some((row) => {
      const errors = getRowValidationErrors(row, draft);
      return Boolean(
        errors.accrualRate || errors.annualAllowance || errors.hourCap,
      );
    });

    if (hasErrors) {
      toast.error("Fix validation errors before saving benchmark policies.");
      return;
    }

    startSaveTransition(async () => {
      const formData = new FormData();
      formData.set("tenantId", tenantId);
      formData.set("draft", JSON.stringify(draft));

      try {
        await saveTimeOffBenchmarkPolicies(formData);
        toast.success("Time-off benchmark policies saved.");
      } catch {
        toast.error("Could not save benchmark policies.");
      }
    });
  };

  const clearAll = () => {
    setDraft(createEmptyTimeOffBenchmarkDraft());
    setShouldRunValidation(false);
  };

  const resetToSaved = () => {
    setDraft(normalizeTimeOffBenchmarkDraft(initialDraft));
    setShouldRunValidation(false);
    toast.success("Reverted to last saved benchmark policies.");
  };

  return (
    <div className="space-y-4">
      <FormSection
        title="Benchmark Time-Off Policies"
        headerAction={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearAll}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={resetToSaved}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Revert
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save benchmark policies"}
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <div className="grid min-w-[760px] grid-cols-[minmax(0,1fr)_9rem_7rem_10rem_6rem] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <div className="text-left normal-case">Policy</div>
            <div className="text-center normal-case">Accrual frequency</div>
            <div className="flex justify-center text-center normal-case">
              <Clarification
                term="Accrual rate %"
                description={ACCRUAL_RATE_CLARIFICATION}
              />
            </div>
            <div className="text-center normal-case">
              Annual allowance (hrs)
            </div>
            <div className="flex justify-center text-center normal-case">
              <Clarification
                term="Hour cap"
                description={HOUR_CAP_CLARIFICATION}
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {TIME_OFF_ROWS.map((row) => {
              const rowErrors = shouldRunValidation
                ? getRowValidationErrors(row, draft)
                : {};

              return (
                <div
                  key={row.accrualRateName}
                  className="grid min-w-[760px] grid-cols-[minmax(0,1fr)_9rem_7rem_10rem_6rem] items-start gap-2 px-3 py-2"
                >
                  <div className="flex h-10 items-center text-sm text-slate-700">
                    {row.accrualRateName === "vacationTimeOff" ? (
                      <Clarification
                        term={row.policy}
                        description={VACATION_POLICY_CLARIFICATION}
                      />
                    ) : (
                      row.policy
                    )}
                  </div>
                  <div>
                    <select
                      value={draft.frequency[row.accrualRateName]}
                      onChange={(event) => {
                        const value = event.target.value;
                        setDraft((current) => ({
                          ...current,
                          frequency: {
                            ...current.frequency,
                            [row.accrualRateName]: value,
                          },
                        }));
                      }}
                      aria-label={`${row.policy} accrual frequency`}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value=""></option>
                      {ACCRUAL_FREQUENCY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      value={draft.accrualRate[row.accrualRateName]}
                      onChange={(event) => {
                        const value = event.target.value;
                        setDraft((current) => ({
                          ...current,
                          accrualRate: {
                            ...current.accrualRate,
                            [row.accrualRateName]: value,
                          },
                        }));
                      }}
                      placeholder="0.00"
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-center text-sm placeholder:text-slate-400",
                        rowErrors.accrualRate
                          ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                          : "border-slate-300",
                      )}
                    />
                    {rowErrors.accrualRate && (
                      <p className="mt-1 text-xs text-red-600">
                        {rowErrors.accrualRate}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      value={draft.annualAllowance[row.accrualRateName]}
                      onChange={(event) => {
                        const value = event.target.value;
                        setDraft((current) => ({
                          ...current,
                          annualAllowance: {
                            ...current.annualAllowance,
                            [row.accrualRateName]: value,
                          },
                        }));
                      }}
                      placeholder="0.00"
                      aria-label={`${row.policy} hours per year`}
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-center text-sm placeholder:text-slate-400",
                        rowErrors.annualAllowance
                          ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                          : "border-slate-300",
                      )}
                    />
                    {rowErrors.annualAllowance && (
                      <p className="mt-1 text-xs text-red-600">
                        {rowErrors.annualAllowance}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      value={draft.hourCap[row.accrualRateName]}
                      onChange={(event) => {
                        const value = event.target.value;
                        setDraft((current) => ({
                          ...current,
                          hourCap: {
                            ...current.hourCap,
                            [row.accrualRateName]: value,
                          },
                        }));
                      }}
                      placeholder="0.00"
                      aria-label={`${row.policy} capped at hours`}
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-center text-sm placeholder:text-slate-400",
                        rowErrors.hourCap
                          ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                          : "border-slate-300",
                      )}
                    />
                    {rowErrors.hourCap && (
                      <p className="mt-1 text-xs text-red-600">
                        {rowErrors.hourCap}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </FormSection>
      <p className="text-sm text-slate-500">
        Benchmark values are saved to the tenant profile and can be used as a
        reference during employee setup.
      </p>
    </div>
  );
}
