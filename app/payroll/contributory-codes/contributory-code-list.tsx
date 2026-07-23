"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { type ContributoryMethod } from "@prisma/client";
import Tooltip from "@/components/tool-tip";
import { contributoryCodeContent } from "@/constants/content";
import ContributoryCodeActions from "./contributory-code-actions";

type ContributoryCodeFilter = "all" | "active" | "inactive";
type ContributoryCodeSort =
  | "code-asc"
  | "code-desc"
  | "description-asc"
  | "description-desc"
  | "category-asc"
  | "category-desc";

type ContributoryCodeListItem = {
  id: string;
  code: string;
  description: string;
  categoryLabel: string;
  employeeDeductionMethod: ContributoryMethod;
  employeeDeductionRate: string;
  employeeExcludedEarnings: string;
  employeeDeductionLimit: string | null;
  employeeDeductionAtSource: "POST_TAX" | "PRE_TAX" | "TAX_CREDIT";
  employeeT4BoxNumber: number | null;
  employerParticipationMethod: ContributoryMethod;
  employerParticipationRate: string | null;
  employerExcludedEarnings: string | null;
  employerParticipationLimit: string | null;
  earningCode: string | null;
  isActive: boolean;
};

type ContributoryCodeListProps = {
  tenantId: string;
  contributoryCodes: ContributoryCodeListItem[];
  deactivateContributoryCode: (formData: FormData) => void | Promise<void>;
  deleteContributoryCode: (formData: FormData) => void | Promise<void>;
};

function compareText(
  leftValue: string,
  rightValue: string,
  direction: "asc" | "desc",
) {
  const result = leftValue.localeCompare(rightValue, undefined, {
    sensitivity: "base",
  });
  return direction === "asc" ? result : -result;
}

function getVisibleCountLabel(visibleCount: number, totalCount: number) {
  if (totalCount === 0) return "No contributory codes";
  if (visibleCount === totalCount) {
    return totalCount === 1
      ? "1 contributory code"
      : `${totalCount} contributory codes`;
  }
  return `${visibleCount} of ${totalCount} contributory codes`;
}

function toNumericValue(value: string | number | null): number {
  if (value === null) return Number.NaN;
  if (typeof value === "number") return value;
  return Number.parseFloat(value);
}

function formatCurrencyAmount(value: string | number | null): string {
  const numericValue = toNumericValue(value);
  if (!Number.isFinite(numericValue)) return "-";

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function formatWholeCurrencyAmount(value: string | number | null): string {
  const numericValue = toNumericValue(value);
  if (!Number.isFinite(numericValue)) return "$0";

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatRoundedUpWholeCurrencyAmount(
  value: string | number | null,
): string {
  const numericValue = toNumericValue(value);
  if (!Number.isFinite(numericValue)) return "-";

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.ceil(numericValue));
}

function formatContributoryRate(
  method: ContributoryMethod,
  rate: string | null,
) {
  if (method === "NONE") return "None";

  if (method === "PERCENT_OF_GROSS") {
    const numericValue = toNumericValue(rate);
    if (!Number.isFinite(numericValue)) return "-";
    return `${numericValue}%`;
  }

  const moneyLabel = formatCurrencyAmount(rate);
  if (moneyLabel === "-") return moneyLabel;

  if (method === "FLAT_AMOUNT") {
    return formatRoundedUpWholeCurrencyAmount(rate);
  }

  if (method === "PER_HOUR_WORKED") return `${moneyLabel}/hr`;
  return moneyLabel;
}

function hasPositiveAmount(value: string | number | null): boolean {
  const numericValue = toNumericValue(value);
  return Number.isFinite(numericValue) && numericValue > 0;
}

function shouldShowRateTooltip(
  excludedEarnings: string | number | null,
  capAmount: string | number | null,
): boolean {
  return hasPositiveAmount(excludedEarnings) || hasPositiveAmount(capAmount);
}

function getRateTooltipContent(
  excludedEarnings: string | number | null,
  capAmount: string | number | null,
): string {
  const hasExcludedEarnings = hasPositiveAmount(excludedEarnings);
  const hasCap = hasPositiveAmount(capAmount);
  const capLabel = formatWholeCurrencyAmount(capAmount);

  if (hasExcludedEarnings && hasCap) {
    return `Exclude earnings ${formatWholeCurrencyAmount(excludedEarnings)}; Cap ${capLabel}`;
  }

  if (hasExcludedEarnings) {
    return `Exclude earnings ${formatWholeCurrencyAmount(excludedEarnings)}`;
  }

  if (hasCap) {
    return `Cap ${capLabel}`;
  }

  return "No exclusions or cap";
}

function formatAtSourceLabel(
  value: "POST_TAX" | "PRE_TAX" | "TAX_CREDIT",
): "Post" | "Before" | "Credit" {
  if (value === "PRE_TAX") return "Before";
  if (value === "TAX_CREDIT") return "Credit";
  return "Post";
}

function HeaderClarification({
  term,
  description,
}: {
  term: string;
  description: string;
}) {
  return (
    <span className="inline-flex items-center justify-center gap-1">
      <span>{term}</span>
      <Tooltip content={description} placement="top" align="center">
        <button
          type="button"
          className="cursor-help text-gray-400 transition-colors hover:text-blue-500 focus:outline-none"
          aria-label={`More info about ${term}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </Tooltip>
    </span>
  );
}

export default function ContributoryCodeList({
  tenantId,
  contributoryCodes,
  deactivateContributoryCode,
  deleteContributoryCode,
}: ContributoryCodeListProps) {
  const [contributoryCodeFilter, setContributoryCodeFilter] =
    useState<ContributoryCodeFilter>("all");
  const [contributoryCodeSort, setContributoryCodeSort] =
    useState<ContributoryCodeSort>("code-asc");
  const [isListMenuOpen, setIsListMenuOpen] = useState(false);
  const isFilterActive = contributoryCodeFilter !== "all";
  const isSortActive = contributoryCodeSort !== "code-asc";

  useEffect(() => {
    if (!isListMenuOpen) return;

    function handleOutsideMouseDown(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-contributory-code-list-menu]")) {
        setIsListMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideMouseDown);
    };
  }, [isListMenuOpen]);

  const visibleContributoryCodes = useMemo(() => {
    return contributoryCodes
      .filter((contributoryCode) => {
        if (contributoryCodeFilter === "active")
          return contributoryCode.isActive;
        if (contributoryCodeFilter === "inactive")
          return !contributoryCode.isActive;
        return true;
      })
      .sort((leftCode, rightCode) => {
        if (contributoryCodeSort === "code-asc") {
          return compareText(leftCode.code, rightCode.code, "asc");
        }
        if (contributoryCodeSort === "code-desc") {
          return compareText(leftCode.code, rightCode.code, "desc");
        }
        if (contributoryCodeSort === "description-asc") {
          return compareText(
            leftCode.description,
            rightCode.description,
            "asc",
          );
        }
        if (contributoryCodeSort === "description-desc") {
          return compareText(
            leftCode.description,
            rightCode.description,
            "desc",
          );
        }
        if (contributoryCodeSort === "category-asc") {
          return compareText(
            leftCode.categoryLabel,
            rightCode.categoryLabel,
            "asc",
          );
        }
        return compareText(
          leftCode.categoryLabel,
          rightCode.categoryLabel,
          "desc",
        );
      });
  }, [contributoryCodeFilter, contributoryCodeSort, contributoryCodes]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-600">
          {getVisibleCountLabel(
            visibleContributoryCodes.length,
            contributoryCodes.length,
          )}
        </p>
        <div
          className="relative self-start sm:self-auto"
          data-contributory-code-list-menu
        >
          <button
            type="button"
            onClick={() => setIsListMenuOpen((isOpen) => !isOpen)}
            aria-expanded={isListMenuOpen}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span
              className={
                isSortActive
                  ? "underline decoration-dotted underline-offset-4"
                  : undefined
              }
            >
              Sort
            </span>
            <span>/</span>
            <span
              className={
                isFilterActive
                  ? "underline decoration-dotted underline-offset-4"
                  : undefined
              }
            >
              Filter
            </span>
          </button>
          {isListMenuOpen ? (
            <div className="absolute right-0 top-10 z-20 min-w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Filter
              </p>
              <div className="space-y-1 pb-2">
                <button
                  type="button"
                  onClick={() => setContributoryCodeFilter("all")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    contributoryCodeFilter === "all"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  All contributory codes
                </button>
                <button
                  type="button"
                  onClick={() => setContributoryCodeFilter("active")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    contributoryCodeFilter === "active"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Active only
                </button>
                <button
                  type="button"
                  onClick={() => setContributoryCodeFilter("inactive")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    contributoryCodeFilter === "inactive"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Inactive only
                </button>
              </div>
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Sort
              </p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setContributoryCodeSort("code-asc")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    contributoryCodeSort === "code-asc"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Code A-Z
                </button>
                <button
                  type="button"
                  onClick={() => setContributoryCodeSort("code-desc")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    contributoryCodeSort === "code-desc"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Code Z-A
                </button>
                <button
                  type="button"
                  onClick={() => setContributoryCodeSort("description-asc")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    contributoryCodeSort === "description-asc"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Description A-Z
                </button>
                <button
                  type="button"
                  onClick={() => setContributoryCodeSort("description-desc")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    contributoryCodeSort === "description-desc"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Description Z-A
                </button>
                <button
                  type="button"
                  onClick={() => setContributoryCodeSort("category-asc")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    contributoryCodeSort === "category-asc"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Category A-Z
                </button>
                <button
                  type="button"
                  onClick={() => setContributoryCodeSort("category-desc")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    contributoryCodeSort === "category-desc"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Category Z-A
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {contributoryCodes.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          No contributory codes configured yet for this employer.
        </p>
      ) : visibleContributoryCodes.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          No contributory codes match the selected filter.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto overflow-y-visible">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">
                  Code
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">
                  Description
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">
                  Category
                </th>
                <th className="px-3 py-2 text-center font-semibold text-slate-700">
                  <HeaderClarification
                    term="Employee deduction"
                    description="For Flat amount, the displayed amount is annualized."
                  />
                </th>
                <th className="px-3 py-2 text-center font-semibold text-slate-700">
                  <HeaderClarification
                    term={
                      contributoryCodeContent.employeeDeductionAtSource.term
                    }
                    description={
                      contributoryCodeContent.employeeDeductionAtSource
                        .description
                    }
                  />
                </th>
                <th className="px-3 py-2 text-center font-semibold text-slate-700">
                  T4 box
                </th>
                <th className="px-3 py-2 text-center font-semibold text-slate-700">
                  <HeaderClarification
                    term="Employer participation"
                    description="For Flat amount, the displayed amount is annualized."
                  />
                </th>
                <th className="px-3 py-2 text-center font-semibold text-slate-700">
                  Earning code
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleContributoryCodes.map((contributoryCode) => (
                <tr key={contributoryCode.id}>
                  <td className="px-3 py-2 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{contributoryCode.code}</span>
                      {!contributoryCode.isActive ? (
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                          Inactive
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {contributoryCode.description}
                  </td>
                  <td className="max-w-56 overflow-hidden whitespace-nowrap px-3 py-2 text-slate-700">
                    {contributoryCode.categoryLabel}
                  </td>
                  <td className="px-3 py-2 text-center text-slate-700">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {contributoryCode.employeeDeductionMethod ===
                          "FLAT_AMOUNT" &&
                        hasPositiveAmount(
                          contributoryCode.employeeExcludedEarnings,
                        ) ? (
                          <Tooltip
                            content={`Exclude earnings ${formatRoundedUpWholeCurrencyAmount(contributoryCode.employeeExcludedEarnings)}`}
                            placement="top"
                            align="start"
                            bottomAnchor
                            focusOnly
                          >
                            <button
                              type="button"
                              className="font-medium text-slate-800 underline decoration-dotted underline-offset-2"
                              aria-label="Show excluded earnings amount"
                            >
                              {formatContributoryRate(
                                contributoryCode.employeeDeductionMethod,
                                contributoryCode.employeeDeductionRate,
                              )}
                            </button>
                          </Tooltip>
                        ) : (contributoryCode.employeeDeductionMethod ===
                            "PERCENT_OF_GROSS" ||
                            contributoryCode.employeeDeductionMethod ===
                              "PER_HOUR_WORKED") &&
                          shouldShowRateTooltip(
                            contributoryCode.employeeExcludedEarnings,
                            contributoryCode.employeeDeductionLimit,
                          ) ? (
                          <Tooltip
                            content={getRateTooltipContent(
                              contributoryCode.employeeExcludedEarnings,
                              contributoryCode.employeeDeductionLimit,
                            )}
                            placement="top"
                            align="start"
                            bottomAnchor
                            focusOnly
                          >
                            <button
                              type="button"
                              className="font-medium text-slate-800 underline decoration-dotted underline-offset-2"
                              aria-label="Show deduction details"
                            >
                              {formatContributoryRate(
                                contributoryCode.employeeDeductionMethod,
                                contributoryCode.employeeDeductionRate,
                              )}
                            </button>
                          </Tooltip>
                        ) : (
                          <p className="font-medium text-slate-800">
                            {formatContributoryRate(
                              contributoryCode.employeeDeductionMethod,
                              contributoryCode.employeeDeductionRate,
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center text-slate-700">
                    {formatAtSourceLabel(
                      contributoryCode.employeeDeductionAtSource,
                    )}
                  </td>
                  <td className="px-3 py-2 text-center text-slate-700">
                    {contributoryCode.employeeT4BoxNumber ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-center text-slate-700">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {contributoryCode.employerParticipationMethod ===
                          "FLAT_AMOUNT" &&
                        hasPositiveAmount(
                          contributoryCode.employerExcludedEarnings,
                        ) ? (
                          <Tooltip
                            content={`Exclude earnings ${formatRoundedUpWholeCurrencyAmount(contributoryCode.employerExcludedEarnings)}`}
                            placement="top"
                            align="start"
                            bottomAnchor
                            focusOnly
                          >
                            <button
                              type="button"
                              className="font-medium text-slate-800 underline decoration-dotted underline-offset-2"
                              aria-label="Show excluded earnings amount"
                            >
                              {formatContributoryRate(
                                contributoryCode.employerParticipationMethod,
                                contributoryCode.employerParticipationRate,
                              )}
                            </button>
                          </Tooltip>
                        ) : (contributoryCode.employerParticipationMethod ===
                            "PERCENT_OF_GROSS" ||
                            contributoryCode.employerParticipationMethod ===
                              "PER_HOUR_WORKED") &&
                          shouldShowRateTooltip(
                            contributoryCode.employerExcludedEarnings,
                            contributoryCode.employerParticipationLimit,
                          ) ? (
                          <Tooltip
                            content={getRateTooltipContent(
                              contributoryCode.employerExcludedEarnings,
                              contributoryCode.employerParticipationLimit,
                            )}
                            placement="top"
                            align="start"
                            bottomAnchor
                            focusOnly
                          >
                            <button
                              type="button"
                              className="font-medium text-slate-800 underline decoration-dotted underline-offset-2"
                              aria-label="Show participation details"
                            >
                              {formatContributoryRate(
                                contributoryCode.employerParticipationMethod,
                                contributoryCode.employerParticipationRate,
                              )}
                            </button>
                          </Tooltip>
                        ) : (
                          <p className="font-medium text-slate-800">
                            {formatContributoryRate(
                              contributoryCode.employerParticipationMethod,
                              contributoryCode.employerParticipationRate,
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center text-slate-700">
                    {contributoryCode.earningCode ?? "N/A"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <ContributoryCodeActions
                      code={contributoryCode.code}
                      contributoryCodeId={contributoryCode.id}
                      tenantId={tenantId}
                      editHref={`/payroll/contributory-codes?tenantId=${tenantId}&editId=${contributoryCode.id}`}
                      isActive={contributoryCode.isActive}
                      deactivateContributoryCode={deactivateContributoryCode}
                      deleteContributoryCode={deleteContributoryCode}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
