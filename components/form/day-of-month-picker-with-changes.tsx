"use client";

import { useEffect, useRef, useState } from "react";
import { FieldValues, Path } from "react-hook-form";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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
  relativeLabel?: string;
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
  relativeLabel = "Relative days to payday",
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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [relativeValue, setRelativeValue] = useState("");

  useEffect(() => {
    const initial = hiddenInputRef.current?.value ?? "";
    const initialRelative = hiddenRelativeInputRef.current?.value ?? "";

    if (initialRelative) {
      setRelativeValue(initialRelative);
      return;
    }

    if (initial) {
      setValue(initial);
      return;
    }

    if (defaultDay == null) {
      return;
    }

    const nextDefault = String(defaultDay);
    setValue(nextDefault);
    registration.onChange({
      target: { name: registration.name, value: nextDefault },
      type: "change",
    });
  }, []);

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

  const clearDaySelection = () => {
    setValue("");
    registration.onChange({
      target: { name: registration.name, value: "" },
      type: "change",
    });
    registration.onBlur({
      target: { name: registration.name, value: "" },
      type: "blur",
    });
  };

  const onSelectDay = (day: number) => {
    const nextValue = String(day);
    clearRelativeSelection();
    setValue(nextValue);

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

  const updateRelativeValue = (nextValue: string) => {
    if (!relativeRegistration) return;

    if (nextValue === "") {
      setRelativeValue("");
      relativeRegistration.onChange({
        target: { name: relativeRegistration.name, value: "" },
        type: "change",
      });
      relativeRegistration.onBlur({
        target: { name: relativeRegistration.name, value: "" },
        type: "blur",
      });
      return;
    }

    const numericValue = Number(nextValue);
    const clampedValue = String(Math.max(-31, Math.min(31, numericValue)));

    clearDaySelection();
    setRelativeValue(clampedValue);
    relativeRegistration.onChange({
      target: { name: relativeRegistration.name, value: clampedValue },
      type: "change",
    });
    relativeRegistration.onBlur({
      target: { name: relativeRegistration.name, value: clampedValue },
      type: "blur",
    });
  };

  const shiftRelativeValue = (delta: number) => {
    const currentValue = relativeValue === "" ? 0 : Number(relativeValue);
    updateRelativeValue(String(currentValue + delta));
  };

  const displayValue =
    relativeValue !== ""
      ? `${relativeValue} day${relativeValue === "1" || relativeValue === "-1" ? "" : "s"} to payday`
      : value
        ? `Day ${value}`
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
          <span>{displayValue}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            {relativeRegistration && (
              <div className="mb-3 space-y-1 px-1">
                <div className="flex w-full items-center justify-between gap-0">
                  {[-14, -7, -1].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => shiftRelativeValue(delta)}
                      className="rounded-md px-1 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`${delta} days`}
                    >
                      {delta}
                    </button>
                  ))}

                  <div className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-100/80 px-1 py-1">
                    <button
                      type="button"
                      onClick={() => shiftRelativeValue(-1)}
                      className="rounded-md p-0.5 text-slate-700 hover:bg-white"
                      aria-label="Decrease relative days"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <input
                      type="number"
                      min={-31}
                      max={31}
                      value={relativeValue}
                      onChange={(event) =>
                        updateRelativeValue(event.target.value)
                      }
                      placeholder="0"
                      className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-sm font-semibold text-slate-900"
                      aria-label={relativeLabel}
                    />

                    <button
                      type="button"
                      onClick={() => shiftRelativeValue(1)}
                      className="rounded-md p-0.5 text-slate-700 hover:bg-white"
                      aria-label="Increase relative days"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {[1, 7, 14].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => shiftRelativeValue(delta)}
                      className="rounded-md px-1 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`+${delta} days`}
                    >
                      +{delta}
                    </button>
                  ))}
                </div>

                <div className="text-center text-xs text-slate-500">
                  {relativeLabel}
                </div>
              </div>
            )}

            <div className="grid w-full grid-cols-8 gap-0 px-1">
              {Array.from({ length: 31 }).map((_, index) => {
                const day = index + 1;
                const selected = day === selectedDay;

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
