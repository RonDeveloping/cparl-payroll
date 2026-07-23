"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
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
  TIME_OFF_CODE_ROWS,
  TIME_OFF_CODE_TYPE_OPTIONS,
  TIME_OFF_ROWS,
  type TimeOffAccrualRateName,
  type TimeOffBenchmarkDraft,
  VACATION_POLICY_CLARIFICATION,
} from "@/constants/time-off-policies";

type TimeOffValidationError = {
  accrualRate?: string;
  annualAllowance?: string;
  hourCap?: string;
};

type TimeOffCodeRow = {
  code: string;
  description: string;
  typeLabel: (typeof TIME_OFF_CODE_TYPE_OPTIONS)[number];
  unpaid: boolean;
  isDefault: boolean;
  accrualRateName?: TimeOffAccrualRateName;
  fixedFrequency?: string;
  fixedAccrualRate?: string;
  fixedAnnualAllowance?: string;
  fixedHourCap?: string;
  frequency?: string;
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
  const [codeRows, setCodeRows] = useState<TimeOffCodeRow[]>(() =>
    TIME_OFF_CODE_ROWS.map((row) => ({
      code: row.code,
      description: row.description,
      typeLabel: row.typeLabel,
      unpaid: row.code !== "SVACP" && row.code !== "SVACA",
      isDefault: true,
      accrualRateName: row.accrualRateName,
      ...(row.code === "SFAMI"
        ? {
            fixedFrequency: "Anniversary date",
            fixedAccrualRate: "",
            fixedAnnualAllowance: "22.5",
            fixedHourCap: "22.5",
          }
        : {}),
      ...(row.code === "SBERE"
        ? {
            fixedFrequency: "Anniversary date",
            fixedAccrualRate: "",
            fixedAnnualAllowance: "15",
            fixedHourCap: "15",
          }
        : {}),
    })),
  );
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTypeLabel, setNewTypeLabel] =
    useState<TimeOffCodeRow["typeLabel"]>("Bereavement");
  const [newUnpaid, setNewUnpaid] = useState(false);
  const [newFrequency, setNewFrequency] = useState("");
  const [newAccrualRate, setNewAccrualRate] = useState("");
  const [newAnnualAllowance, setNewAnnualAllowance] = useState("");
  const [newHourCap, setNewHourCap] = useState("");
  const [activeActionRowKey, setActiveActionRowKey] = useState<string | null>(
    null,
  );
  const [shouldRunValidation, setShouldRunValidation] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();

  const rowByAccrualRateName = new Map(
    TIME_OFF_ROWS.map((row) => [row.accrualRateName, row] as const),
  );

  const formatDisplayValue = (value: string | null | undefined) => {
    const trimmed = value?.trim() || "";
    return trimmed || "-";
  };

  const hasPendingAddInputs =
    newCode.trim() ||
    newDescription.trim() ||
    newFrequency.trim() ||
    newAccrualRate.trim() ||
    newAnnualAllowance.trim() ||
    newHourCap.trim();

  const buildPendingCodeRow = (): TimeOffCodeRow | null => {
    const code = newCode.trim().toUpperCase();
    const description = newDescription.trim();

    if (!hasPendingAddInputs) {
      return null;
    }

    if (!code || !description) {
      toast.error("Enter both code and description before saving.");
      return null;
    }

    if (codeRows.some((row) => row.code === code)) {
      toast.error("This time-off code already exists in the list.");
      return null;
    }

    return {
      code,
      description,
      typeLabel: newTypeLabel,
      unpaid: newUnpaid,
      isDefault: false,
      frequency: newFrequency,
      accrualRate: newAccrualRate,
      annualAllowance: newAnnualAllowance,
      hourCap: newHourCap,
    };
  };

  const resetAddInputs = () => {
    setNewCode("");
    setNewDescription("");
    setNewTypeLabel("Bereavement");
    setNewUnpaid(false);
    setNewFrequency("");
    setNewAccrualRate("");
    setNewAnnualAllowance("");
    setNewHourCap("");
  };

  const handleSave = () => {
    setShouldRunValidation(true);

    const pendingCodeRow = buildPendingCodeRow();
    if (hasPendingAddInputs && !pendingCodeRow) {
      return;
    }

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

    if (pendingCodeRow) {
      setCodeRows((current) => [...current, pendingCodeRow]);
      resetAddInputs();
      toast.success(`Added ${pendingCodeRow.code} to the list.`);
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
      <FormSection title="Time-Off Code List">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid min-w-[1036px] grid-cols-[6rem_minmax(0,1.9fr)_6rem_3rem_9rem_6rem_10rem_6rem_6rem] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <div className="text-left normal-case">Code</div>
            <div className="text-left normal-case">Description</div>
            <div className="text-left normal-case">Category</div>
            <div className="text-center normal-case">Unpaid</div>
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
            <div className="text-center normal-case">Action</div>
          </div>
          <div className="divide-y divide-slate-100">
            {codeRows.map((row) => {
              const rowMetadata = row.accrualRateName
                ? rowByAccrualRateName.get(row.accrualRateName)
                : null;
              const displayFrequency =
                row.fixedFrequency ??
                (row.accrualRateName
                  ? draft.frequency[row.accrualRateName]
                  : row.frequency);
              const displayAccrualRate =
                row.fixedAccrualRate ??
                (row.accrualRateName
                  ? draft.accrualRate[row.accrualRateName]
                  : row.accrualRate);
              const displayAnnualAllowance =
                row.fixedAnnualAllowance ??
                (row.accrualRateName
                  ? draft.annualAllowance[row.accrualRateName]
                  : row.annualAllowance);
              const displayHourCap =
                row.fixedHourCap ??
                (row.accrualRateName
                  ? draft.hourCap[row.accrualRateName]
                  : row.hourCap);
              const rowKey = `${row.code}-${row.typeLabel}`;

              return (
                <div
                  key={rowKey}
                  className="grid min-w-[1036px] grid-cols-[6rem_minmax(0,1.9fr)_6rem_3rem_9rem_6rem_10rem_6rem_6rem] items-start gap-2 px-3 py-3"
                >
                  <div className="pt-2 text-sm font-semibold text-slate-900">
                    {row.code}
                  </div>
                  <div className="pt-2 text-sm text-slate-700">
                    {row.description}
                  </div>
                  <div className="pt-2 text-sm text-slate-600">
                    {row.typeLabel}
                  </div>
                  <div className="flex justify-center pt-1">
                    <input
                      type="checkbox"
                      checked={row.unpaid}
                      disabled
                      aria-label={`${row.code} unpaid`}
                      className="h-4 w-4 rounded border-slate-300 text-slate-700"
                    />
                  </div>
                  <div className="pt-2 text-sm text-slate-600">
                    {formatDisplayValue(displayFrequency)}
                  </div>
                  <div className="pt-2 text-center text-sm text-slate-600">
                    {formatDisplayValue(displayAccrualRate)}
                  </div>
                  <div className="pt-2 text-center text-sm text-slate-600">
                    {formatDisplayValue(displayAnnualAllowance)}
                  </div>
                  <div className="pt-2 text-center text-sm text-slate-600">
                    {formatDisplayValue(displayHourCap)}
                  </div>
                  <div className="relative flex justify-center">
                    {row.isDefault ? (
                      <span className="pt-2 text-xs text-slate-400">
                        Default
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          aria-label={`Manage ${row.code}`}
                          onClick={() =>
                            setActiveActionRowKey((current) =>
                              current === rowKey ? null : rowKey,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {activeActionRowKey === rowKey ? (
                          <div className="absolute right-0 top-10 z-10 min-w-32 rounded-xl border border-slate-200 bg-white p-1 text-left shadow-lg">
                            <button
                              type="button"
                              onClick={() => {
                                setCodeRows((current) =>
                                  current.filter(
                                    (currentRow) =>
                                      `${currentRow.code}-${currentRow.typeLabel}` !==
                                      rowKey,
                                  ),
                                );
                                setActiveActionRowKey(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Remove</span>
                            </button>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Add Time-Off Code"
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
              {isSaving ? "Saving..." : "Save Time-Off Code"}
            </button>
          </div>
        }
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid min-w-[1016px] grid-cols-[6rem_minmax(0,1.9fr)_6rem_3rem_9rem_6rem_10rem_6rem] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <div className="text-left normal-case">Code</div>
            <div className="text-left normal-case">Description</div>
            <div className="text-left normal-case">Category</div>
            <div className="text-center normal-case">Unpaid</div>
            <div className="text-center normal-case">Accrual frequency</div>
            <div className="text-center normal-case">Accrual rate %</div>
            <div className="text-center normal-case">
              Annual allowance (hrs)
            </div>
            <div className="text-center normal-case">Hour cap</div>
          </div>
          <div className="grid min-w-[1016px] grid-cols-[6rem_minmax(0,1.9fr)_6rem_3rem_9rem_6rem_10rem_6rem] items-start gap-2 px-3 py-3">
            <div>
              <input
                value={newCode}
                onChange={(event) => setNewCode(event.target.value)}
                placeholder="e.g. VAC"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase"
              />
            </div>
            <div>
              <input
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="e.g. Vacation pay"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <select
                value={newTypeLabel}
                onChange={(event) =>
                  setNewTypeLabel(
                    event.target.value as TimeOffCodeRow["typeLabel"],
                  )
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {TIME_OFF_CODE_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-center pt-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={newUnpaid}
                  onChange={(event) => setNewUnpaid(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-700"
                />
                <span className="sr-only">Unpaid</span>
              </label>
            </div>
            <div>
              <select
                value={newFrequency}
                onChange={(event) => setNewFrequency(event.target.value)}
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
                value={newAccrualRate}
                onChange={(event) => setNewAccrualRate(event.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-center text-sm"
              />
            </div>
            <div>
              <input
                value={newAnnualAllowance}
                onChange={(event) => setNewAnnualAllowance(event.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-center text-sm"
              />
            </div>
            <div>
              <input
                value={newHourCap}
                onChange={(event) => setNewHourCap(event.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-center text-sm"
              />
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          Ontario default off parameters are editable directly in the list
          above.
        </p>
      </FormSection>
    </div>
  );
}
