"use client";

import { useEffect, useRef, useState } from "react";
import { FieldValues, Path } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputGroupStyles, inputWithChangesStyles } from "@/constants/styles";
import { useFormChangeContext } from "@/components/form/form-change-context";
import { CapLabel } from "@/components/shared/cap-label";

interface DayOfMonthPickerWithChangesProps<TFormValues extends FieldValues> {
  label: React.ReactNode;
  name: Path<TFormValues>;
  error?: string;
  placeholder?: string;
  defaultDay?: number | null;
  relativeName?: Path<TFormValues>;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function DayOfMonthPickerWithChanges<
  TFormValues extends FieldValues,
>({
  label,
  name,
  error,
  placeholder = "Choose a day (1-31)",
  defaultDay = 31,
  relativeName,
}: DayOfMonthPickerWithChangesProps<TFormValues>) {
  const { changes, showChanges, register } =
    useFormChangeContext<TFormValues>();
  const change = changes.find(
    (c) => c.name === name || (relativeName != null && c.name === relativeName),
  );

  const registration = register(name);
  const relativeRegistration = relativeName ? register(relativeName) : null;
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenRelativeInputRef = useRef<HTMLInputElement | null>(null);
  const initializedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [relativeValue, setRelativeValue] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [paydayMonth] = useState(() => startOfMonth(new Date()));
  const [pickedMonthOffset, setPickedMonthOffset] = useState(0);

  const initializeFromHiddenInputs = () => {
    if (initializedRef.current) return;

    const initial = hiddenInputRef.current?.value ?? "";
    const initialRelative = hiddenRelativeInputRef.current?.value ?? "";

    if (initialRelative) {
      initializedRef.current = true;
      setRelativeValue(initialRelative);
      return;
    }

    if (initial) {
      initializedRef.current = true;
      setValue(initial);
      return;
    }

    if (defaultDay == null) {
      initializedRef.current = true;
      return;
    }

    const nextDefault = String(defaultDay);
    initializedRef.current = true;
    setValue(nextDefault);
    registration.onChange({
      target: { name: registration.name, value: nextDefault },
      type: "change",
    });
  };

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectedDay = Number(value);
  const showCalendarNavigation = Boolean(relativeRegistration);
  const monthOffsetFromPayday =
    (visibleMonth.getFullYear() - paydayMonth.getFullYear()) * 12 +
    (visibleMonth.getMonth() - paydayMonth.getMonth());
  const canGoPrevMonth = monthOffsetFromPayday > -1;
  const canGoNextMonth = monthOffsetFromPayday < 1;

  const getMonthRelationSentenceText = (offset: number) =>
    offset < 0 ? "prior month" : offset > 0 ? "next month" : "the month";

  const getDayLabel = (day: number) => {
    if (day === 29) return "-3";
    if (day === 30) return "-2";
    if (day === 31) return "-1";
    return String(day);
  };

  const getDaySentenceText = (dayValue: string) => {
    if (dayValue === "31") return "Last day";
    if (dayValue === "30") return "2nd-to-last day";
    if (dayValue === "29") return "3rd-to-last day";
    return `Day ${dayValue}`;
  };

  const monthRelationLabel =
    monthOffsetFromPayday < 0 ? (
      <>
        The month <span className="underline">before</span> the payday
      </>
    ) : monthOffsetFromPayday > 0 ? (
      <>
        The month <span className="underline">after</span> the payday
      </>
    ) : (
      <>
        The month <span className="underline">of</span> the payday
      </>
    );

  const clearRelativeSelection = () => {
    if (!relativeRegistration) return;
    setRelativeValue("");
    relativeRegistration.onChange({
      target: { name: relativeRegistration.name, value: "" },
      type: "change",
    });
    relativeRegistration.onBlur({
      target: { name: relativeRegistration.name, value: "" },
      type: "blur",
    });
  };

  const onSelectDay = (day: number) => {
    const nextValue = String(day);
    clearRelativeSelection();
    setValue(nextValue);
    setPickedMonthOffset(monthOffsetFromPayday);

    registration.onChange({
      target: { name: registration.name, value: nextValue },
      type: "change",
    });

    registration.onBlur({
      target: { name: registration.name, value: nextValue },
      type: "blur",
    });

    setIsOpen(false);
  };

  const displayValue =
    relativeValue !== ""
      ? `${relativeValue} day${relativeValue === "1" || relativeValue === "-1" ? "" : "s"} to payday`
      : value
        ? showCalendarNavigation
          ? `${getDaySentenceText(value)} in ${getMonthRelationSentenceText(pickedMonthOffset)}`
          : `${getDaySentenceText(value)} in a month`
        : placeholder;

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
          initializeFromHiddenInputs();
        }}
      />

      {relativeRegistration && (
        <input
          type="hidden"
          {...relativeRegistration}
          value={relativeValue}
          ref={(element) => {
            relativeRegistration.ref(element);
            hiddenRelativeInputRef.current = element;
            initializeFromHiddenInputs();
          }}
        />
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className={cn(
            inputGroupStyles.inputBase,
            "flex w-full items-center justify-between",
            error ? inputGroupStyles.inputError : inputGroupStyles.inputDefault,
            value || relativeValue ? "text-slate-900" : "text-slate-400",
          )}
        >
          <span className="truncate whitespace-nowrap pr-2">
            {displayValue}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            {showCalendarNavigation && (
              <div className="mb-3 px-1">
                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-100/80 px-2 py-1.5">
                  <button
                    type="button"
                    disabled={!canGoPrevMonth}
                    onClick={() =>
                      canGoPrevMonth &&
                      setVisibleMonth(
                        new Date(
                          visibleMonth.getFullYear(),
                          visibleMonth.getMonth() - 1,
                          1,
                        ),
                      )
                    }
                    className="rounded-md px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-40"
                    aria-label="Previous month"
                  >
                    {"<"}
                  </button>

                  <div className="text-center text-sm font-semibold text-slate-900">
                    {monthRelationLabel}
                  </div>

                  <button
                    type="button"
                    disabled={!canGoNextMonth}
                    onClick={() =>
                      canGoNextMonth &&
                      setVisibleMonth(
                        new Date(
                          visibleMonth.getFullYear(),
                          visibleMonth.getMonth() + 1,
                          1,
                        ),
                      )
                    }
                    className="rounded-md px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-40"
                    aria-label="Next month"
                  >
                    {">"}
                  </button>
                </div>
              </div>
            )}

            <div className={cn("grid w-full gap-0 px-1", "grid-cols-8")}>
              {Array.from({ length: 31 }).map((_, index) => {
                const day = index + 1;
                const selected = relativeValue === "" && day === selectedDay;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onSelectDay(day)}
                    className={cn(
                      "h-6 w-full rounded-md text-[11px] transition-transform duration-150 hover:scale-110",
                      selected
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100",
                    )}
                  >
                    {getDayLabel(day)}
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
