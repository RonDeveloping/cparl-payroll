"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { EarningType } from "@prisma/client";
import EarningCodeActions from "@/app/payroll/earning-type/earning-code-actions";
import { Clarification } from "@/components/clarification";

type EarningCodeFilter = "all" | "active" | "inactive";
type EarningCodeSort =
  | "code-asc"
  | "code-desc"
  | "description-asc"
  | "description-desc"
  | "type-asc"
  | "type-desc";

type EarningCodeListItem = {
  id: string;
  code: string;
  description: string;
  displayDescription: string;
  earningType: EarningType;
  isHourly: boolean;
  isTaxable: boolean;
  isSubjectToCPP: boolean;
  isSubjectToEI: boolean;
  isActive: boolean;
  isProtectedCode: boolean;
  t4BoxNumber: string | null;
};

type EarningCodeListProps = {
  tenantId: string;
  earningCodes: EarningCodeListItem[];
  deactivateEarningCode: (formData: FormData) => void | Promise<void>;
  deleteEarningCode: (formData: FormData) => void | Promise<void>;
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
  if (totalCount === 0) return "No earning codes";
  if (visibleCount === totalCount) {
    return totalCount === 1 ? "1 earning code" : `${totalCount} earning codes`;
  }
  return `${visibleCount} of ${totalCount} earning codes`;
}

function isDefaultDescriptionCode(code: string) {
  return code === "REG" || code === "SAL";
}

export default function EarningCodeList({
  tenantId,
  earningCodes,
  deactivateEarningCode,
  deleteEarningCode,
}: EarningCodeListProps) {
  const [earningCodeFilter, setEarningCodeFilter] =
    useState<EarningCodeFilter>("all");
  const [earningCodeSort, setEarningCodeSort] =
    useState<EarningCodeSort>("code-asc");
  const [isListMenuOpen, setIsListMenuOpen] = useState(false);
  const isEarningCodeFilterActive = earningCodeFilter !== "all";
  const isEarningCodeSortActive = earningCodeSort !== "code-asc";

  useEffect(() => {
    if (!isListMenuOpen) return;

    function handleOutsideMouseDown(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-earning-code-list-menu]")) {
        setIsListMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideMouseDown);
    };
  }, [isListMenuOpen]);

  const visibleEarningCodes = useMemo(() => {
    return earningCodes
      .filter((earningCode) => {
        if (earningCodeFilter === "active") return earningCode.isActive;
        if (earningCodeFilter === "inactive") return !earningCode.isActive;
        return true;
      })
      .sort((leftCode, rightCode) => {
        if (earningCodeSort === "code-asc") {
          return compareText(leftCode.code, rightCode.code, "asc");
        }
        if (earningCodeSort === "code-desc") {
          return compareText(leftCode.code, rightCode.code, "desc");
        }
        if (earningCodeSort === "description-asc") {
          return compareText(
            leftCode.displayDescription,
            rightCode.displayDescription,
            "asc",
          );
        }
        if (earningCodeSort === "description-desc") {
          return compareText(
            leftCode.displayDescription,
            rightCode.displayDescription,
            "desc",
          );
        }
        if (earningCodeSort === "type-asc") {
          return compareText(
            leftCode.earningType,
            rightCode.earningType,
            "asc",
          );
        }
        return compareText(leftCode.earningType, rightCode.earningType, "desc");
      });
  }, [earningCodeFilter, earningCodeSort, earningCodes]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-600">
          {getVisibleCountLabel(
            visibleEarningCodes.length,
            earningCodes.length,
          )}
        </p>
        <div
          className="relative self-start sm:self-auto"
          data-earning-code-list-menu
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
                isEarningCodeSortActive
                  ? "underline decoration-dotted underline-offset-4"
                  : undefined
              }
            >
              Sort
            </span>
            <span>/</span>
            <span
              className={
                isEarningCodeFilterActive
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
                  onClick={() => setEarningCodeFilter("all")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    earningCodeFilter === "all"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  All earning codes
                </button>
                <button
                  type="button"
                  onClick={() => setEarningCodeFilter("active")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    earningCodeFilter === "active"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Active only
                </button>
                <button
                  type="button"
                  onClick={() => setEarningCodeFilter("inactive")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    earningCodeFilter === "inactive"
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
                  onClick={() => setEarningCodeSort("code-asc")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    earningCodeSort === "code-asc"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Code A-Z
                </button>
                <button
                  type="button"
                  onClick={() => setEarningCodeSort("code-desc")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    earningCodeSort === "code-desc"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Code Z-A
                </button>
                <button
                  type="button"
                  onClick={() => setEarningCodeSort("description-asc")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    earningCodeSort === "description-asc"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Description A-Z
                </button>
                <button
                  type="button"
                  onClick={() => setEarningCodeSort("description-desc")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    earningCodeSort === "description-desc"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Description Z-A
                </button>
                <button
                  type="button"
                  onClick={() => setEarningCodeSort("type-asc")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    earningCodeSort === "type-asc"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Earning Type A-Z
                </button>
                <button
                  type="button"
                  onClick={() => setEarningCodeSort("type-desc")}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    earningCodeSort === "type-desc"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Earning Type Z-A
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {earningCodes.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          No earning codes configured yet for this employer.
        </p>
      ) : visibleEarningCodes.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          No earning codes match the selected filter.
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
                  Earning Type
                </th>
                <th className="px-3 py-2 text-center font-semibold text-slate-700">
                  Hourly
                </th>
                <th className="px-3 py-2 text-center font-semibold text-slate-700">
                  Taxable
                </th>
                <th className="px-3 py-2 text-center font-semibold text-slate-700">
                  <span className="inline-flex justify-center">
                    <Clarification
                      term="CPP"
                      description="Pensionable for Canada Pension Plan."
                    />
                  </span>
                </th>
                <th className="px-3 py-2 text-center font-semibold text-slate-700">
                  <span className="inline-flex justify-center">
                    <Clarification
                      term="EI"
                      description="Insurable for EI benefit."
                    />
                  </span>
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleEarningCodes.map((earningCode) => {
                const editHref = `/payroll/earning-type?tenantId=${tenantId}&editId=${earningCode.id}`;

                return (
                  <tr key={earningCode.id}>
                    <td className="px-3 py-2 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{earningCode.code}</span>
                        {!earningCode.isActive ? (
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                            Inactive
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      <div className="flex items-start justify-between gap-3">
                        <span>{earningCode.displayDescription}</span>
                        {isDefaultDescriptionCode(earningCode.code) ? (
                          <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            Default
                          </span>
                        ) : earningCode.t4BoxNumber ? (
                          <span
                            title={`Reported in T4 box ${earningCode.t4BoxNumber}`}
                            className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600"
                          >
                            T4 Box {earningCode.t4BoxNumber}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {earningCode.earningType}
                    </td>
                    <td className="px-3 py-2 text-center text-slate-700">
                      {earningCode.isHourly ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-2 text-center text-slate-700">
                      {earningCode.isTaxable ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-2 text-center text-slate-700">
                      {earningCode.isSubjectToCPP ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-2 text-center text-slate-700">
                      {earningCode.isSubjectToEI ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <EarningCodeActions
                        code={earningCode.code}
                        earningCodeId={earningCode.id}
                        tenantId={tenantId}
                        editHref={editHref}
                        isActive={earningCode.isActive}
                        isProtectedCode={earningCode.isProtectedCode}
                        deactivateEarningCode={deactivateEarningCode}
                        deleteEarningCode={deleteEarningCode}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
