"use client";

import { FieldValues, Path } from "react-hook-form";
import { useFormChangeContext } from "./form-change-context";
import { CapLabel } from "../shared/cap-label";
import { inputGroupStyles, inputWithChangesStyles } from "@/constants/styles";
import { cn } from "@/lib/utils";

interface SelectOption {
  label: string;
  value: string;
}

export interface SelectWithChangesProps<TFormValues extends FieldValues> {
  label: React.ReactNode;
  name: Path<TFormValues>;
  error?: string;
  options: SelectOption[];
}

export default function SelectWithChanges<TFormValues extends FieldValues>({
  label,
  name,
  error,
  options,
}: SelectWithChangesProps<TFormValues>) {
  const { changes, showChanges, register } =
    useFormChangeContext<TFormValues>();

  const change = changes.find((c) => c.name === name);

  return (
    <div className={inputWithChangesStyles.wrapper}>
      <div className={inputWithChangesStyles.headerRow}>
        <CapLabel>{label}</CapLabel>
        {showChanges && change && (
          <span className={inputWithChangesStyles.changeText}>
            {String(change.before)}
          </span>
        )}
      </div>
      <div className={inputGroupStyles.wrapper}>
        <select
          {...register(name)}
          className={cn(
            inputGroupStyles.inputBase,
            error ? inputGroupStyles.inputError : inputGroupStyles.inputDefault,
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className={inputGroupStyles.errorText}>{error}</span>}
      </div>
    </div>
  );
}
