"use client";

import { useState } from "react";
import { type ContributoryMethod } from "@prisma/client";
import { Clarification } from "@/components/clarification";

type EmployerParticipationFieldsProps = {
  employerParticipationOptions: readonly {
    value: ContributoryMethod;
    label: string;
  }[];
  rateAmountClarification: string;
  participationExcludedEarningsClarification: string;
  participationLimitClarification: string;
  earningCodeTerm: string;
  earningCodeDescription: string;
  earningCodeOptions: readonly {
    id: string;
    code: string;
    description: string;
  }[];
  initialMethod?: ContributoryMethod;
  initialRate?: string;
  initialExcludedEarnings?: string;
  initialLimit?: string;
  initialEarningCodeCode?: string;
};

export default function EmployerParticipationFields({
  employerParticipationOptions,
  rateAmountClarification,
  participationExcludedEarningsClarification,
  participationLimitClarification,
  earningCodeTerm,
  earningCodeDescription,
  earningCodeOptions,
  initialMethod,
  initialRate,
  initialExcludedEarnings,
  initialLimit,
  initialEarningCodeCode,
}: EmployerParticipationFieldsProps) {
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

  const [employerParticipationMethod, setEmployerParticipationMethod] =
    useState<ContributoryMethod>(initialMethod ?? "NONE");

  const isFlatAmount = employerParticipationMethod === "FLAT_AMOUNT";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <div>
        <label
          htmlFor="employer-participation-method"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Employer participation
        </label>
        <select
          id="employer-participation-method"
          name="employerParticipationMethod"
          aria-label="Employer participation method"
          value={employerParticipationMethod}
          onChange={(event) =>
            setEmployerParticipationMethod(
              event.target.value as ContributoryMethod,
            )
          }
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        >
          {employerParticipationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          <Clarification
            term="Participation rate"
            description={rateAmountClarification}
          />
        </label>
        <input
          type="text"
          name="employerParticipationRate"
          placeholder="e.g. 1,200, 100%, or 1.50"
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
            description={participationExcludedEarningsClarification}
          />
        </label>
        <input
          type="text"
          name="employerExemptEarnings"
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
            term="Participation limit"
            description={participationLimitClarification}
          />
        </label>
        <input
          type="text"
          name="employerParticipationLimit"
          placeholder={
            isFlatAmount ? "Same as participation rate" : "e.g. 1,200"
          }
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
            term={earningCodeTerm}
            description={earningCodeDescription}
          />
        </label>
        <select
          name="earningCodeCode"
          defaultValue={initialEarningCodeCode ?? ""}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        >
          <option value="">Not Applicable</option>
          <option value="BEN">
            BEN - In-kind benefit, e.g. group life insurance
          </option>
          {earningCodeOptions.map((code) => (
            <option key={code.id} value={code.code}>
              {code.code} - {code.description}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
