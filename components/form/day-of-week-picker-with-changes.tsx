"use client";

import { useEffect, useRef, useState } from "react";
import { FieldValues, Path } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputGroupStyles, inputWithChangesStyles } from "@/constants/styles";
import { useFormChangeContext } from "@/components/form/form-change-context";
import { CapLabel } from "@/components/shared/cap-label";

interface DayOfWeekPickerWithChangesProps<TFormValues extends FieldValues> {
  label: React.ReactNode;
  name: Path<TFormValues>;
  error?: string;
  placeholder?: string;
  defaultWeekday?: string | null;
  relativeWeekName?: Path<TFormValues>;
  defaultRelativeWeekOffsetDays?: number;
}

type WeekOffset = number;

const MIN_WEEK_OFFSET = -50;
const MAX_WEEK_OFFSET = 2;
const WEEK_LIST_WINDOW_SIZE = 5;

const WEEKDAY_OPTIONS = [
  { value: "MONDAY", short: "Mon", display: "Monday" },
  { value: "TUESDAY", short: "Tue", display: "Tuesday" },
  { value: "WEDNESDAY", short: "Wed", display: "Wednesday" },
  { value: "THURSDAY", short: "Thu", display: "Thursday" },
  { value: "FRIDAY", short: "Fri", display: "Friday" },
  { value: "SATURDAY", short: "Sat", display: "Saturday" },
  { value: "SUNDAY", short: "Sun", display: "Sunday" },
];

function clampWeekOffset(value: number): WeekOffset {
  return Math.max(MIN_WEEK_OFFSET, Math.min(MAX_WEEK_OFFSET, value));
}

function getOffsetFromDays(value: string): WeekOffset {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 0;
  return clampWeekOffset(Math.round(numeric / 7));
}

function getOffsetDaysFromIndex(index: WeekOffset): string {
  return String(index * 7);
}

function formatWeekOffset(offset: WeekOffset): string {
  if (offset === 0) return "0";
  return offset > 0 ? `+${offset}` : String(offset);
}

function getWeekListOffsets(center: WeekOffset): WeekOffset[] {
  const minStart = MIN_WEEK_OFFSET;
  const maxStart = MAX_WEEK_OFFSET - (WEEK_LIST_WINDOW_SIZE - 1);
  const start = Math.max(
    minStart,
    Math.min(maxStart, clampWeekOffset(center) - 1),
  );
  return Array.from({ length: WEEK_LIST_WINDOW_SIZE }, (_, index) =>
    clampWeekOffset(start + index),
  );
}

function formatRelativeWeekdaySelection(
  weekday: string,
  offset: WeekOffset,
): string {
  if (offset === 0) return `${weekday} of this week`;
  if (offset === -1) return `${weekday} of last week`;
  if (offset === 1) return `Next ${weekday}`;
  if (offset === 2) return `${weekday} after next`;

  const weekCountLabels: Record<number, string> = {
    2: "two",
    3: "three",
    4: "four",
  };
  const weekCount = Math.abs(offset);
  const weekCountLabel = weekCountLabels[weekCount] ?? String(weekCount);

  if (offset < 0) return `${weekday} of ${weekCountLabel} weeks ago`;
  return `${weekday} of ${weekCountLabel} weeks from now`;
}

export default function DayOfWeekPickerWithChanges<
  TFormValues extends FieldValues,
>({
  label,
  name,
  error,
  placeholder = "Choose weekday",
  defaultWeekday = "MONDAY",
  relativeWeekName,
  defaultRelativeWeekOffsetDays = -7,
}: DayOfWeekPickerWithChangesProps<TFormValues>) {
  const { changes, showChanges, register } =
    useFormChangeContext<TFormValues>();
  const change = changes.find(
    (c) =>
      c.name === name ||
      (relativeWeekName != null && c.name === relativeWeekName),
  );

  const registration = register(name);
  const relativeRegistration = relativeWeekName
    ? register(relativeWeekName)
    : null;
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenRelativeInputRef = useRef<HTMLInputElement | null>(null);
  const initializedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [relativeValue, setRelativeValue] = useState("");
  const [visibleWeekOffset, setVisibleWeekOffset] = useState<WeekOffset>(
    clampWeekOffset(Math.round(defaultRelativeWeekOffsetDays / 7)),
  );
  const [pickedWeekOffset, setPickedWeekOffset] = useState<WeekOffset>(
    clampWeekOffset(Math.round(defaultRelativeWeekOffsetDays / 7)),
  );
  const weekListOffsets = getWeekListOffsets(visibleWeekOffset);

  const initializeFromHiddenInputs = () => {
    if (initializedRef.current) return;

    const initialWeekday = hiddenInputRef.current?.value ?? "";
    const initialRelative = hiddenRelativeInputRef.current?.value ?? "";

    const nextWeekday = initialWeekday || (defaultWeekday ?? "");
    if (nextWeekday) {
      setValue(nextWeekday);
      registration.onChange({
        target: { name: registration.name, value: nextWeekday },
        type: "change",
      });
    }

    if (relativeRegistration) {
      const nextRelative =
        initialRelative ||
        String(
          clampWeekOffset(Math.round(defaultRelativeWeekOffsetDays / 7)) * 7,
        );
      setRelativeValue(nextRelative);
      relativeRegistration.onChange({
        target: { name: relativeRegistration.name, value: nextRelative },
        type: "change",
      });

      const offset = getOffsetFromDays(nextRelative);
      setVisibleWeekOffset(offset);
      setPickedWeekOffset(offset);
    }

    initializedRef.current = true;
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

  const selectedOption = WEEKDAY_OPTIONS.find(
    (option) => option.value === value,
  );

  const onSelectWeekday = (weekday: string, weekOffset?: WeekOffset) => {
    const effectiveOffset =
      weekOffset == null ? visibleWeekOffset : clampWeekOffset(weekOffset);

    setValue(weekday);
    setVisibleWeekOffset(effectiveOffset);
    setPickedWeekOffset(effectiveOffset);

    registration.onChange({
      target: { name: registration.name, value: weekday },
      type: "change",
    });

    registration.onBlur({
      target: { name: registration.name, value: weekday },
      type: "blur",
    });

    if (relativeRegistration) {
      const offsetDays = getOffsetDaysFromIndex(effectiveOffset);
      setRelativeValue(offsetDays);
      relativeRegistration.onChange({
        target: { name: relativeRegistration.name, value: offsetDays },
        type: "change",
      });
      relativeRegistration.onBlur({
        target: { name: relativeRegistration.name, value: offsetDays },
        type: "blur",
      });
    }

    setIsOpen(false);
  };

  const displayValue = selectedOption
    ? relativeRegistration
      ? formatRelativeWeekdaySelection(selectedOption.display, pickedWeekOffset)
      : `${selectedOption.display} in a week`
    : placeholder;

  const formatWeekOptionLabel = (offset: WeekOffset) => {
    if (offset === 0) return "Payday Week (PW)";
    return `PW${formatWeekOffset(offset)}`;
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
            value ? "text-slate-900" : "text-slate-400",
          )}
        >
          <span className="truncate whitespace-nowrap pr-2">
            {displayValue}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            {relativeRegistration && (
              <div className="mb-3 grid grid-cols-2 gap-3 px-1">
                <div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      disabled={visibleWeekOffset <= MIN_WEEK_OFFSET}
                      onClick={() =>
                        setVisibleWeekOffset((current) =>
                          clampWeekOffset(current - 1),
                        )
                      }
                      className="w-full rounded-md px-2 py-1 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                      aria-label="Show earlier weeks"
                    >
                      ^
                    </button>

                    {weekListOffsets.map((offset) => (
                      <button
                        key={offset}
                        type="button"
                        onClick={() => setVisibleWeekOffset(offset)}
                        className={cn(
                          "w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold",
                          visibleWeekOffset === offset
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                        )}
                        aria-label={`Set week ${formatWeekOffset(offset)} from payday week`}
                      >
                        {formatWeekOptionLabel(offset)}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={visibleWeekOffset >= MAX_WEEK_OFFSET}
                      onClick={() =>
                        setVisibleWeekOffset((current) =>
                          clampWeekOffset(current + 1),
                        )
                      }
                      className="w-full rounded-md px-2 py-1 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                      aria-label="Show later weeks"
                    >
                      v
                    </button>
                  </div>
                </div>

                <div>
                  <div className="space-y-1">
                    {WEEKDAY_OPTIONS.map((option) => {
                      const selected =
                        option.value === value &&
                        pickedWeekOffset === visibleWeekOffset;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => onSelectWeekday(option.value)}
                          className={cn(
                            "w-full rounded-md px-2 py-1.5 text-left text-xs font-medium",
                            selected
                              ? "bg-slate-900 text-white"
                              : "text-slate-700 hover:bg-slate-100",
                          )}
                        >
                          {option.display}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {!relativeRegistration && (
              <>
                <div className="mb-2 grid w-full grid-cols-7 gap-1 px-1 text-center text-xs font-semibold text-slate-500">
                  {WEEKDAY_OPTIONS.map((option) => (
                    <div key={option.value} className="py-1">
                      {option.short}
                    </div>
                  ))}
                </div>

                <div className="grid w-full grid-cols-7 gap-1 px-1">
                  {WEEKDAY_OPTIONS.map((option) => {
                    const selected = option.value === value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onSelectWeekday(option.value)}
                        className={cn(
                          "h-8 w-full rounded-md text-xs font-medium",
                          selected
                            ? "bg-slate-900 text-white"
                            : "text-slate-700 hover:bg-slate-100",
                        )}
                      >
                        {option.short}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {error && <span className={inputGroupStyles.errorText}>{error}</span>}
    </div>
  );
}
