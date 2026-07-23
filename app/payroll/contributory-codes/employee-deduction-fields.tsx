"use client";

import { useState } from "react";
import { type ContributoryMethod } from "@prisma/client";
import { Clarification } from "@/components/clarification";
import { contributoryCodeContent } from "@/constants/content";
import { T4_DEDUCTION_BOX_OPTIONS } from "@/constants/t4-boxes";

type EmployeeDeductionFieldsProps = {
  employeeDeductionOptions: readonly {
    value: ContributoryMethod;
    label: string;
  }[];
  rateAmountClarification: string;
  deductionExcludedEarningsClarification: string;
  deductionLimitClarification: string;
  initialMethod?: ContributoryMethod;
  initialRate?: string;
  initialExcludedEarnings?: string;
  initialLimit?: string;
  initialAtSource?: "POST_TAX" | "PRE_TAX" | "TAX_CREDIT";
  initialT4BoxNumber?: string;
};

export default function EmployeeDeductionFields({
  employeeDeductionOptions,
  rateAmountClarification,
  deductionExcludedEarningsClarification,
  deductionLimitClarification,
  initialMethod,
  initialRate,
  initialExcludedEarnings,
  initialLimit,
  initialAtSource,
  initialT4BoxNumber,
}: EmployeeDeductionFieldsProps) {
  const formatTwoDecimalWithCommas = (rawValue: string): string => {
    const cleanedValue = rawValue.replace(/,/g, "").trim();
    if (!cleanedValue) return "";

    const numericValue = Number.parseFloat(cleanedValue);
    if (!Number.isFinite(numericValue)) return rawValue;

    return new Intl.NumberFormat("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const handleAmountBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.value = formatTwoDecimalWithCommas(
      event.currentTarget.value,
    );
  };

  const handleRateBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const rawValue = event.currentTarget.value;
    if (rawValue.includes("%")) return;

    event.currentTarget.value = formatTwoDecimalWithCommas(rawValue);
  };

  const [employeeDeductionMethod, setEmployeeDeductionMethod] =
    useState<ContributoryMethod>(
      initialMethod ?? employeeDeductionOptions[0]?.value ?? "FLAT_AMOUNT",
    );

  const isFlatAmount = employeeDeductionMethod === "FLAT_AMOUNT";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <div>
        <label
          htmlFor="employee-deduction-method"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Employee deduction
        </label>
        <select
          id="employee-deduction-method"
          name="employeeDeductionMethod"
          aria-label="Employee deduction method"
          value={employeeDeductionMethod}
          onChange={(event) =>
            setEmployeeDeductionMethod(event.target.value as ContributoryMethod)
          }
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        >
          {employeeDeductionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          <Clarification
            term="Deduction rate"
            description={rateAmountClarification}
          />
        </label>
        <input
          type="text"
          name="employeeDeductionRate"
          placeholder="e.g. 1,200, 4%, or 2.00"
          defaultValue={initialRate}
          inputMode="decimal"
          onBlur={handleRateBlur}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          <Clarification
            term="Excluded earnings"
            description={deductionExcludedEarningsClarification}
          />
        </label>
        <input
          type="text"
          name="employeeExemptEarnings"
          placeholder="e.g. 1,200"
          defaultValue={initialExcludedEarnings}
          inputMode="decimal"
          onBlur={handleAmountBlur}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          <Clarification
            term="Deduction limit"
            description={deductionLimitClarification}
          />
        </label>
        <input
          type="text"
          name="employeeDeductionLimit"
          placeholder={isFlatAmount ? "Same as deduction rate" : "e.g. 1,200"}
          defaultValue={initialLimit}
          inputMode="decimal"
          onBlur={handleAmountBlur}
          disabled={isFlatAmount}
          className={
            isFlatAmount
              ? "w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-400 placeholder:text-slate-400"
              : "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400"
          }
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          <Clarification
            term={contributoryCodeContent.employeeDeductionAtSource.term}
            description={
              contributoryCodeContent.employeeDeductionAtSource.description
            }
          />
        </label>
        <select
          name="employeeDeductionAtSource"
          defaultValue={initialAtSource ?? "POST_TAX"}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        >
          <option value="POST_TAX">Post</option>
          <option value="PRE_TAX">Before</option>
          <option value="TAX_CREDIT">Credit</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          <Clarification
            term={contributoryCodeContent.employeeT4DeductionBox.term}
            description={
              contributoryCodeContent.employeeT4DeductionBox.description
            }
          />
        </label>
        <select
          name="employeeT4BoxNumber"
          defaultValue={initialT4BoxNumber ?? ""}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        >
          <option value="">None</option>
          {T4_DEDUCTION_BOX_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
