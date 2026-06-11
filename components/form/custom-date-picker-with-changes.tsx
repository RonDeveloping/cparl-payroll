"use client";
// components/form/custom-date-picker-with-changes.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { FieldValues, Path, RegisterOptions } from "react-hook-form";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputGroupStyles, inputWithChangesStyles } from "@/constants/styles";
import { useFormChangeContext } from "@/components/form/form-change-context";
import { CapLabel } from "@/components/shared/cap-label";

interface CustomDatePickerWithChangesProps<TFormValues extends FieldValues> {
  label: React.ReactNode;
  name: Path<TFormValues>;
  error?: string;
  placeholder?: string;
  rules?: RegisterOptions<TFormValues, Path<TFormValues>>;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  /** Year jump amounts shown as buttons. Defaults to [30, 20, 10]. */
  yearJumps?: number[];
  /**
   * Default year offset when field has no value.
   * Example: -18 shows 18 years earlier; 0 shows current year.
   */
  defaultYearOffset?: number;
  /**
   * Whether positive year jumps are shown in reverse order.
   * Defaults to true for legacy layout (e.g. +10 +20 +30 for [30,20,10]).
   */
  reversePositiveYearJumps?: boolean;
  /** Show SMTWTFS weekday header row and align days to weekday columns. Defaults to false. */
  showWeekdays?: boolean;
}

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function clampToMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatIsoDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CustomDatePickerWithChanges<
  TFormValues extends FieldValues,
>({
  label,
  name,
  error,
  placeholder = "YYYY-MM-DD",
  rules,
  minDate,
  maxDate,
  yearJumps = [30, 20, 10],
  defaultYearOffset = -18,
  reversePositiveYearJumps = true,
  showWeekdays = false,
}: CustomDatePickerWithChangesProps<TFormValues>) {
  const { changes, showChanges, register } =
    useFormChangeContext<TFormValues>();
  const change = changes.find((c) => c.name === name);

  const registration = register(name, rules);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const now = new Date();
  // Default to mid-year for easier year-first navigation.
  const defaultMonth = new Date(now.getFullYear() + defaultYearOffset, 6, 1);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [visibleMonth, setVisibleMonth] = useState<Date>(defaultMonth);

  const min = useMemo(
    () => (minDate ? parseIsoDate(minDate) : null),
    [minDate],
  );
  const max = useMemo(
    () => (maxDate ? parseIsoDate(maxDate) : null),
    [maxDate],
  );
  const selectedDate = useMemo(() => parseIsoDate(value), [value]);

  useEffect(() => {
    if (hiddenInputRef.current?.value) {
      const initial = hiddenInputRef.current.value;
      setValue(initial);
      const parsed = parseIsoDate(initial);
      if (parsed) {
        setVisibleMonth(clampToMonth(parsed));
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);

  const daysInMonth = monthEnd.getDate();
  const selectedDayInVisibleMonth = selectedDate
    ? Math.min(selectedDate.getDate(), daysInMonth)
    : Math.ceil(daysInMonth / 2);
  const minMonth = min ? startOfMonth(min) : null;
  const maxMonth = max ? startOfMonth(max) : null;

  const syncValueForVisibleMonth = (month: Date) => {
    const days = endOfMonth(month).getDate();
    const preferredDay = selectedDate
      ? selectedDate.getDate()
      : Math.ceil(days / 2);
    let nextDay = Math.min(preferredDay, days);

    if (
      min &&
      min.getFullYear() === month.getFullYear() &&
      min.getMonth() === month.getMonth()
    ) {
      nextDay = Math.max(nextDay, min.getDate());
    }

    if (
      max &&
      max.getFullYear() === month.getFullYear() &&
      max.getMonth() === month.getMonth()
    ) {
      nextDay = Math.min(nextDay, max.getDate());
    }

    const iso = toIsoDate(
      new Date(month.getFullYear(), month.getMonth(), nextDay),
    );
    setValue(iso);
    registration.onChange({
      target: { name: registration.name, value: iso },
      type: "change",
    });
  };

  const setVisibleMonthSafely = (target: Date) => {
    const normalized = startOfMonth(target);
    if (minMonth && normalized < minMonth) {
      setVisibleMonth(minMonth);
      syncValueForVisibleMonth(minMonth);
      return;
    }
    if (maxMonth && normalized > maxMonth) {
      setVisibleMonth(maxMonth);
      syncValueForVisibleMonth(maxMonth);
      return;
    }
    setVisibleMonth(normalized);
    syncValueForVisibleMonth(normalized);
  };

  const canGoPrev = !min || monthStart > startOfMonth(min);
  const canGoNext = !max || monthStart < startOfMonth(max);

  const getDefaultVisibleMonth = () => {
    const normalizedDefault = startOfMonth(defaultMonth);
    if (minMonth && normalizedDefault < minMonth) return minMonth;
    if (maxMonth && normalizedDefault > maxMonth) return maxMonth;
    return normalizedDefault;
  };

  const isDisabled = (date: Date) => {
    if (min && date < min) return true;
    if (max && date > max) return true;
    return false;
  };

  const onSelectDate = (date: Date) => {
    if (isDisabled(date)) return;

    const iso = toIsoDate(date);
    setValue(iso);

    registration.onChange({
      target: { name: registration.name, value: iso },
      type: "change",
    });

    registration.onBlur({
      target: { name: registration.name, value: iso },
      type: "blur",
    });

    setIsOpen(false);
  };

  return (
    <div className={inputWithChangesStyles.wrapper} ref={rootRef}>
      <div className={inputWithChangesStyles.headerRow}>
        <CapLabel>{label}</CapLabel>
        {showChanges && change && (
          <span className={inputWithChangesStyles.changeText}>
            {change.before === "" || change.before == null
              ? "(empty)"
              : String(change.before)}
          </span>
        )}
      </div>

      <input
        type="hidden"
        {...registration}
        value={value}
        ref={(element) => {
          registration.ref(element);
          hiddenInputRef.current = element;
        }}
      />

      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(event) => {
              const formatted = formatIsoDateInput(event.target.value);
              setValue(formatted);
              registration.onChange({
                target: { name: registration.name, value: formatted },
                type: "change",
              });

              const parsed = parseIsoDate(formatted);
              if (parsed) {
                setVisibleMonth(clampToMonth(parsed));
              }
            }}
            onBlur={() => {
              registration.onBlur({
                target: { name: registration.name, value },
                type: "blur",
              });
            }}
            className={cn(
              inputGroupStyles.inputBase,
              "w-full pr-10",
              value ? "text-slate-900" : "text-slate-400",
              error
                ? inputGroupStyles.inputError
                : inputGroupStyles.inputDefault,
            )}
          />
          <button
            type="button"
            onClick={() => {
              const parsed = parseIsoDate(value);
              if (!parsed) {
                setVisibleMonth(getDefaultVisibleMonth());
              }
              setIsOpen((open) => !open);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Open calendar"
          >
            <Calendar className="h-4 w-4" />
          </button>
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            <div className="mb-2 space-y-1 px-1">
              <div className="flex w-full items-center justify-between gap-0">
                {yearJumps.map((jump) => (
                  <button
                    key={`-${jump}`}
                    type="button"
                    onClick={() =>
                      setVisibleMonthSafely(
                        new Date(
                          visibleMonth.getFullYear() - jump,
                          visibleMonth.getMonth(),
                          1,
                        ),
                      )
                    }
                    className="rounded-md px-1 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Previous ${jump} years`}
                  >
                    -{jump}
                  </button>
                ))}

                <div className="flex shrink-0 items-center justify-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100/80 px-0.5 py-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      const previousYear = new Date(
                        visibleMonth.getFullYear() - 1,
                        visibleMonth.getMonth(),
                        1,
                      );
                      setVisibleMonthSafely(previousYear);
                    }}
                    disabled={Boolean(
                      minMonth &&
                      new Date(
                        visibleMonth.getFullYear() - 1,
                        visibleMonth.getMonth(),
                        1,
                      ) < minMonth,
                    )}
                    className="rounded-md p-0.5 text-slate-700 hover:bg-white disabled:opacity-40"
                    aria-label="Previous year"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="min-w-[4ch] rounded-md px-1.5 py-1 text-center text-sm font-bold text-slate-900">
                    {visibleMonth.getFullYear()}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nextYear = new Date(
                        visibleMonth.getFullYear() + 1,
                        visibleMonth.getMonth(),
                        1,
                      );
                      setVisibleMonthSafely(nextYear);
                    }}
                    disabled={Boolean(
                      maxMonth &&
                      new Date(
                        visibleMonth.getFullYear() + 1,
                        visibleMonth.getMonth(),
                        1,
                      ) > maxMonth,
                    )}
                    className="rounded-md p-0.5 text-slate-700 hover:bg-white disabled:opacity-40"
                    aria-label="Next year"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {(reversePositiveYearJumps
                  ? [...yearJumps].reverse()
                  : yearJumps
                ).map((jump) => (
                  <button
                    key={`+${jump}`}
                    type="button"
                    onClick={() =>
                      setVisibleMonthSafely(
                        new Date(
                          visibleMonth.getFullYear() + jump,
                          visibleMonth.getMonth(),
                          1,
                        ),
                      )
                    }
                    className="rounded-md px-1 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Next ${jump} years`}
                  >
                    +{jump}
                  </button>
                ))}
              </div>

              <div className="grid w-full grid-cols-[auto_1fr_auto] gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (!canGoPrev) return;
                    setVisibleMonthSafely(
                      new Date(
                        visibleMonth.getFullYear(),
                        visibleMonth.getMonth() - 1,
                        1,
                      ),
                    );
                  }}
                  disabled={!canGoPrev}
                  className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <select
                  aria-label="Select month"
                  value={visibleMonth.getMonth()}
                  onChange={(e) => {
                    const month = Number(e.target.value);
                    setVisibleMonthSafely(
                      new Date(visibleMonth.getFullYear(), month, 1),
                    );
                  }}
                  className="rounded-md border border-slate-300 bg-slate-100/80 px-2 py-1.5 text-center text-sm font-semibold text-slate-900"
                >
                  {MONTH_NAMES.map((monthName, idx) => (
                    <option key={monthName} value={idx}>
                      {String(idx + 1).padStart(2, "0")}-{monthName}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    if (!canGoNext) return;
                    setVisibleMonthSafely(
                      new Date(
                        visibleMonth.getFullYear(),
                        visibleMonth.getMonth() + 1,
                        1,
                      ),
                    );
                  }}
                  disabled={!canGoNext}
                  className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {showWeekdays && (
              <div className="mb-1 grid w-full grid-cols-7 px-1 text-center text-xs font-semibold text-slate-500">
                {"SMTWTFS".split("").map((day, index) => (
                  <div key={`${day}-${index}`} className="py-1">
                    {day}
                  </div>
                ))}
              </div>
            )}

            <div
              className={cn(
                "grid w-full gap-0 px-1",
                showWeekdays ? "grid-cols-7" : "grid-cols-8",
              )}
            >
              {showWeekdays &&
                Array.from({ length: monthStart.getDay() }).map((_, index) => (
                  <div key={`empty-${index}`} />
                ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = new Date(
                  visibleMonth.getFullYear(),
                  visibleMonth.getMonth(),
                  day,
                );
                const disabled = isDisabled(date);
                const selected = day === selectedDayInVisibleMonth;
                const isFallbackDefaultDay = !selectedDate && selected;

                return (
                  <button
                    key={toIsoDate(date)}
                    type="button"
                    onClick={() => onSelectDate(date)}
                    disabled={disabled}
                    className={cn(
                      "h-6 w-full rounded-md text-[11px] transition-transform duration-150 hover:scale-110",
                      isFallbackDefaultDay
                        ? "bg-slate-200 text-slate-500"
                        : selected
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100",
                      disabled &&
                        "cursor-not-allowed text-slate-300 hover:bg-transparent",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {error && <span className={inputGroupStyles.errorText}>{error}</span>}
    </div>
  );
}
