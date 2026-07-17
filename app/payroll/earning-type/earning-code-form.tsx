"use client";

import { useState } from "react";
import { T4_BOX_OPTIONS } from "@/constants/t4-boxes";
import { type EarningTypeValue } from "@/constants/earning-types";

type EarningTypeDefaults = {
  isHourly: boolean;
  isTaxable: boolean;
  isInKind: boolean;
  isSubjectToCPP: boolean;
  isSubjectToEI: boolean;
};

const EARNING_TYPE_DEFAULTS: Record<EarningTypeValue, EarningTypeDefaults> = {
  REGULAR: {
    isHourly: true,
    isTaxable: true,
    isInKind: false,
    isSubjectToCPP: true,
    isSubjectToEI: true,
  },
  OVERTIME: {
    isHourly: true,
    isTaxable: true,
    isInKind: false,
    isSubjectToCPP: true,
    isSubjectToEI: true,
  },
  SICK: {
    isHourly: false,
    isTaxable: true,
    isInKind: false,
    isSubjectToCPP: true,
    isSubjectToEI: true,
  },
  HOLIDAY: {
    isHourly: false,
    isTaxable: true,
    isInKind: false,
    isSubjectToCPP: true,
    isSubjectToEI: true,
  },
  VACATION: {
    isHourly: false,
    isTaxable: true,
    isInKind: false,
    isSubjectToCPP: true,
    isSubjectToEI: true,
  },
  BONUS: {
    isHourly: false,
    isTaxable: true,
    isInKind: false,
    isSubjectToCPP: true,
    isSubjectToEI: true,
  },
  COMMISSION: {
    isHourly: false,
    isTaxable: true,
    isInKind: false,
    isSubjectToCPP: true,
    isSubjectToEI: true,
  },
  TAXABLE_BENEFIT: {
    isHourly: false,
    isTaxable: true,
    isInKind: true,
    isSubjectToCPP: true,
    isSubjectToEI: false,
  },
  REASONABLE_ALLOWANCE: {
    isHourly: false,
    isTaxable: false,
    isInKind: false,
    isSubjectToCPP: false,
    isSubjectToEI: false,
  },
  OTHER: {
    isHourly: false,
    isTaxable: true,
    isInKind: false,
    isSubjectToCPP: true,
    isSubjectToEI: true,
  },
};

function getDefaultsByType(earningType: EarningTypeValue): EarningTypeDefaults {
  return EARNING_TYPE_DEFAULTS[earningType];
}

type EarningCodeFormProps = {
  tenantId: string;
  earningTypeOptions: readonly EarningTypeValue[];
  addEarningCode: (formData: FormData) => void;
};

export default function EarningCodeForm({
  tenantId,
  earningTypeOptions,
  addEarningCode,
}: EarningCodeFormProps) {
  const [earningType, setEarningType] = useState<EarningTypeValue>("REGULAR");
  const [flags, setFlags] = useState<EarningTypeDefaults>(
    getDefaultsByType("REGULAR"),
  );

  function onEarningTypeChange(nextType: EarningTypeValue) {
    setEarningType(nextType);
    setFlags(getDefaultsByType(nextType));
  }

  return (
    <form action={addEarningCode} className="mt-4 grid gap-4 md:grid-cols-2">
      <input type="hidden" name="tenantId" value={tenantId} />

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Code
        <input
          name="code"
          required
          maxLength={20}
          placeholder="REG"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Earning Type
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

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Description
        <input
          name="description"
          required
          maxLength={140}
          placeholder="Regular base pay"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        T4 Box Number (optional)
        <select
          name="t4BoxNumber"
          defaultValue=""
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

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700 md:col-span-2">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="isHourly"
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
            name="isInKind"
            checked={flags.isInKind}
            onChange={(event) => {
              setFlags((current) => ({
                ...current,
                isInKind: event.target.checked,
              }));
            }}
          />
          In Kind
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="isSubjectToCPP"
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

      <div className="md:col-span-2">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Save Earning Code
        </button>
      </div>
    </form>
  );
}
