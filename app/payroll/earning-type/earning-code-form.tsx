"use client";
// app/payroll/earning-type/earning-code-form.tsx

import { useState } from "react";
import { T4_BOX_OPTIONS } from "@/constants/t4-boxes";
import { type EarningTypeValue } from "@/constants/earning-types";
import { earningCodeContent } from "@/constants/content";
import { Clarification } from "@/components/clarification";
import {
  type EarningCodeFlags,
  type EarningCodePolicyMode,
  evaluateEarningTypePolicy,
  getDefaultsByEarningType,
  isCustomizedFromStandard,
} from "@/constants/earning-code-policy";

type EarningCodeFormProps = {
  tenantId: string;
  earningCodeId?: string;
  policyMode: EarningCodePolicyMode;
  canCustomizeFlags: boolean;
  existingCodes: readonly string[];
  earningTypeOptions: readonly EarningTypeValue[];
  saveEarningCode: (formData: FormData) => void | Promise<void>;
  initialValue?: {
    code: string;
    description: string;
    earningType: EarningTypeValue;
    isHourly: boolean;
    isTaxable: boolean;
    isSubjectToCPP: boolean;
    isSubjectToEI: boolean;
    overrideReason: string | null;
    t4BoxNumber: number | null;
  };
};

type EarningCodeSuggestion = {
  code: string;
  description: string;
};

const earningCodeSuggestions: Record<
  EarningTypeValue,
  readonly EarningCodeSuggestion[]
> = {
  REGULAR: [
    { code: "REG", description: "Regular hourly/base pay" },
    { code: "SAL", description: "Salary" },
  ],
  OVERTIME: [
    { code: "OT", description: "Overtime" },
    { code: "OT15", description: "Overtime 1.5x" },
    { code: "DT", description: "Double time" },
  ],
  SICK: [{ code: "SICK", description: "Sick pay" }],
  HOLIDAY: [
    { code: "HOL", description: "Holiday pay" },
    { code: "STAT", description: "Statutory holiday pay" },
  ],
  VACATION: [
    { code: "VAC", description: "Vacation pay" },
    { code: "VACACR", description: "Vacation accrual payout" },
  ],
  BONUS: [{ code: "BON", description: "Bonus" }],
  COMMISSION: [{ code: "COM", description: "Commission" }],
  TAXABLE_BENEFIT: [
    { code: "BEN", description: "Taxable benefit" },
    { code: "AUTO", description: "Automobile benefit" },
  ],
  REASONABLE_ALLOWANCE: [
    { code: "ALW", description: "Allowance" },
    { code: "MEAL", description: "Meal allowance" },
    { code: "KM", description: "Kilometre allowance" },
  ],
  OTHER: [
    { code: "RETRO", description: "Retroactive pay" },
    { code: "SHIFT", description: "Shift premium" },
    { code: "SEV", description: "Severance" },
  ],
};

const earningCodePlaceholders: Record<EarningTypeValue, EarningCodeSuggestion> =
  {
    REGULAR: {
      code: "e.g. RGN",
      description: "e.g. Regular night shift pay",
    },
    OVERTIME: {
      code: "e.g. OT2",
      description: "e.g. Double-time overtime pay",
    },
    SICK: {
      code: "e.g. SICKP",
      description: "e.g. Paid sick leave",
    },
    HOLIDAY: {
      code: "e.g. STAT",
      description: "e.g. Statutory holiday pay",
    },
    VACATION: {
      code: "e.g. VACPO",
      description: "e.g. Vacation payout",
    },
    BONUS: {
      code: "e.g. PERF",
      description: "e.g. Performance bonus",
    },
    COMMISSION: {
      code: "e.g. COMM",
      description: "e.g. Sales commission",
    },
    TAXABLE_BENEFIT: {
      code: "e.g. AUTO",
      description: "e.g. Automobile taxable benefit",
    },
    REASONABLE_ALLOWANCE: {
      code: "e.g. MEAL",
      description: "e.g. Meal allowance",
    },
    OTHER: {
      code: "e.g. SHIFT",
      description: "e.g. Shift premium",
    },
  };

const t4DetailBoxEarningTypes: readonly EarningTypeValue[] = [
  "COMMISSION",
  "TAXABLE_BENEFIT",
  "REASONABLE_ALLOWANCE",
  "OTHER",
];

function canSelectT4DetailBox(earningType: EarningTypeValue) {
  return t4DetailBoxEarningTypes.includes(earningType);
}

export default function EarningCodeForm({
  tenantId,
  earningCodeId,
  policyMode,
  canCustomizeFlags,
  existingCodes,
  earningTypeOptions,
  saveEarningCode,
  initialValue,
}: EarningCodeFormProps) {
  const [code, setCode] = useState(initialValue?.code ?? "");
  const [description, setDescription] = useState(
    initialValue?.description ?? "",
  );
  const [earningType, setEarningType] = useState<EarningTypeValue>(
    initialValue?.earningType ?? "REGULAR",
  );
  const [flags, setFlags] = useState<EarningCodeFlags>(
    initialValue
      ? {
          isHourly: initialValue.isHourly,
          isTaxable: initialValue.isTaxable,
          isSubjectToCPP: initialValue.isSubjectToCPP,
          isSubjectToEI: initialValue.isSubjectToEI,
        }
      : getDefaultsByEarningType("REGULAR"),
  );

  const policyIssues = evaluateEarningTypePolicy(earningType, flags);
  const hardStopIssues = policyIssues.filter(
    (issue) => issue.severity === "hard-stop",
  );
  const warningIssues = policyIssues.filter(
    (issue) => issue.severity === "warning",
  );
  const isCustomized = isCustomizedFromStandard(earningType, flags);
  const showPolicySummary = policyMode !== "GUARDED";
  const showT4DetailBox = canSelectT4DetailBox(earningType);
  const normalizedCode = code.trim().toUpperCase();
  const normalizedExistingCodes = existingCodes.map((existingCode) =>
    existingCode.toUpperCase(),
  );
  const initialNormalizedCode = initialValue?.code.toUpperCase() ?? "";
  const isDuplicateCode =
    normalizedCode.length > 0 &&
    normalizedCode !== initialNormalizedCode &&
    normalizedExistingCodes.includes(normalizedCode);
  const suggestedCodes = earningCodeSuggestions[earningType];
  const placeholder = earningCodePlaceholders[earningType];

  function onEarningTypeChange(nextType: EarningTypeValue) {
    setEarningType(nextType);
    setFlags(getDefaultsByEarningType(nextType));
  }

  function applySuggestion(suggestion: EarningCodeSuggestion) {
    setCode(suggestion.code);
    setDescription(suggestion.description);
  }

  function getCodeValidationMessage(input: HTMLInputElement) {
    if (input.validity.valueMissing) return "Enter an earning code.";
    if (input.validity.tooShort) {
      return "Earning code must be at least 2 characters.";
    }

    return "Use 2-10 characters: letters, numbers, hyphens, or underscores. Spaces are not allowed.";
  }

  async function handleAddEarningCode(formData: FormData) {
    await saveEarningCode(formData);
    setEarningType("REGULAR");
    setFlags(getDefaultsByEarningType("REGULAR"));
    setCode("");
    setDescription("");
  }

  const disableOverrides =
    policyMode === "STRICT" || (policyMode === "GUARDED" && !canCustomizeFlags);

  return (
    <form
      action={handleAddEarningCode}
      className="mt-4 grid gap-4 md:grid-cols-2"
    >
      <input type="hidden" name="tenantId" value={tenantId} />
      {earningCodeId ? (
        <input type="hidden" name="earningCodeId" value={earningCodeId} />
      ) : null}

      <div className="grid gap-4 md:col-span-2 md:grid-cols-2 md:items-start">
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            <Clarification
              term={earningCodeContent.earningType.term}
              description={earningCodeContent.earningType.description}
            />
            <select
              name="earningType"
              required
              value={earningType}
              onChange={(event) =>
                onEarningTypeChange(event.target.value as EarningTypeValue)
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {earningTypeOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          {earningType === "REGULAR" ? null : (
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
              <span className="text-xs text-slate-400">
                Pick a commonly used code of this type
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestedCodes.map((suggestion) => {
                  const suggestionAlreadyExists =
                    normalizedExistingCodes.includes(suggestion.code);

                  return (
                    <button
                      key={suggestion.code}
                      type="button"
                      disabled={suggestionAlreadyExists}
                      title={
                        suggestionAlreadyExists
                          ? `${suggestion.code} already exists for this employer.`
                          : suggestion.description
                      }
                      onClick={() => applySuggestion(suggestion)}
                      className={
                        suggestionAlreadyExists
                          ? "rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-400"
                          : "rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                      }
                    >
                      {suggestion.code}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-slate-700">
              Assign Payroll Treatment
            </span>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isHourly"
                  disabled={disableOverrides}
                  checked={flags.isHourly}
                  onChange={(event) => {
                    setFlags((current) => ({
                      ...current,
                      isHourly: event.target.checked,
                    }));
                  }}
                />
                Hourly
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isTaxable"
                  disabled={disableOverrides}
                  checked={flags.isTaxable}
                  onChange={(event) => {
                    setFlags((current) => ({
                      ...current,
                      isTaxable: event.target.checked,
                    }));
                  }}
                />
                Taxable
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isSubjectToCPP"
                  disabled={disableOverrides}
                  checked={flags.isSubjectToCPP}
                  onChange={(event) => {
                    setFlags((current) => ({
                      ...current,
                      isSubjectToCPP: event.target.checked,
                    }));
                  }}
                />
                Subject to CPP
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isSubjectToEI"
                  disabled={disableOverrides}
                  checked={flags.isSubjectToEI}
                  onChange={(event) => {
                    setFlags((current) => ({
                      ...current,
                      isSubjectToEI: event.target.checked,
                    }));
                  }}
                />
                Subject to EI
              </label>
            </div>
          </div>

          <div className="space-y-2">
            {showPolicySummary ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="rounded-full border border-slate-300 px-2 py-0.5">
                  Policy: {policyMode}
                </span>
                {isCustomized ? (
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-amber-700">
                    Customized from standard
                  </span>
                ) : (
                  <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-emerald-700">
                    Using standard defaults
                  </span>
                )}
              </div>
            ) : null}

            {disableOverrides ? (
              <p className="text-xs text-slate-600">
                Overrides are disabled by tenant policy for this user.
              </p>
            ) : null}

            {warningIssues.length > 0 ? (
              <ul className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                {warningIssues.map((issue, index) => (
                  <li key={`${issue.message}-${index}`}>
                    Warning: {issue.message}
                  </li>
                ))}
              </ul>
            ) : null}

            {hardStopIssues.length > 0 ? (
              <ul className="space-y-1 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {hardStopIssues.map((issue, index) => (
                  <li key={`${issue.message}-${index}`}>
                    Hard stop: {issue.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        <Clarification
          term={earningCodeContent.code.term}
          description={earningCodeContent.code.description}
        />
        <input
          name="code"
          required
          minLength={2}
          maxLength={10}
          pattern="[A-Z0-9][A-Z0-9_-]{1,9}"
          placeholder={placeholder.code}
          title="Use 2-10 characters: letters, numbers, hyphens, or underscores. Spaces are not allowed."
          value={code}
          onInvalid={(event) => {
            event.currentTarget.setCustomValidity(
              getCodeValidationMessage(event.currentTarget),
            );
          }}
          onChange={(event) => {
            event.currentTarget.setCustomValidity("");
            setCode(event.target.value.toUpperCase());
          }}
          aria-invalid={isDuplicateCode}
          className={
            isDuplicateCode
              ? "rounded-md border border-rose-300 px-3 py-2 text-sm outline-rose-300"
              : "rounded-md border border-slate-300 px-3 py-2 text-sm"
          }
        />
        {isDuplicateCode ? (
          <span className="text-xs text-rose-700">
            This code already exists for this employer.
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        <Clarification
          term={earningCodeContent.description.term}
          description={earningCodeContent.description.description}
        />
        <input
          name="description"
          required
          maxLength={140}
          placeholder={placeholder.description}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      {showT4DetailBox ? (
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          T4 Other Information Box
          <select
            name="t4BoxNumber"
            defaultValue={initialValue?.t4BoxNumber ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {T4_BOX_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {policyMode === "GUARDED" && canCustomizeFlags && isCustomized ? (
        <label className="flex flex-col gap-1 text-sm text-slate-700 md:col-span-2">
          Override reason
          <textarea
            name="overrideReason"
            required
            maxLength={240}
            defaultValue={initialValue?.overrideReason ?? ""}
            placeholder="Explain why this earning code differs from standard defaults"
            className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      ) : null}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={isDuplicateCode}
          className={
            isDuplicateCode
              ? "inline-flex cursor-not-allowed items-center rounded-md bg-slate-300 px-4 py-2 text-sm font-medium text-white"
              : "inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          }
        >
          Save
        </button>
      </div>
    </form>
  );
}
