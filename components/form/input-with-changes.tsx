"use client";
// components/form/input-with-changes.tsx
import { FieldValues, Path, RegisterOptions } from "react-hook-form";
import InputGroup from "./input-group";
import { useFormChangeContext } from "./form-change-context";
import { CapLabel } from "../shared/cap-label";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { inputWithChangesStyles } from "@/constants/styles";

export interface InputWithChangesProps<TFormValues extends FieldValues> {
  label: React.ReactNode;
  name: Path<TFormValues>;
  error?: string;
  placeholder?: string;
  type?: string;
  min?: string;
  max?: string;
  rules?: RegisterOptions<TFormValues, Path<TFormValues>>;
  formatOnChange?: (value: string) => string;
  maxLength?: number;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  inputClassName?: string;
  fieldAction?: React.ReactNode;
}

export default function InputWithChanges<TFormValues extends FieldValues>({
  label,
  name,
  error,
  placeholder,
  type = "text",
  min,
  max,
  rules,
  formatOnChange,
  maxLength,
  onBlur,
  onChange,
  readOnly = false,
  inputClassName,
  fieldAction,
}: InputWithChangesProps<TFormValues>) {
  const [showPassword, setShowPassword] = useState(false);
  const { changes, showChanges, register } =
    useFormChangeContext<TFormValues>();

  // find if this input field changed
  const change = changes.find((c) => c.name === name);
  const inputType = type === "password" && showPassword ? "text" : type;

  // Handler to auto-hide password on blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (type === "password" && showPassword) {
      setShowPassword(false);
    }
    onBlur?.(e);
  };

  return (
    <div className={inputWithChangesStyles.wrapper}>
      <div className={inputWithChangesStyles.headerRow}>
        <CapLabel>{label}</CapLabel>
        {/* Change indicator */}
        {showChanges && change && (
          <span className={inputWithChangesStyles.changeText}>
            {change.before === "" || change.before == null
              ? "(empty)"
              : String(change.before)}
          </span>
        )}
      </div>
      <div className={inputWithChangesStyles.inputWrapper}>
        {/* Input */}
        <InputGroup<TFormValues>
          name={name}
          register={register}
          placeholder={placeholder}
          error={error}
          type={inputType}
          min={min}
          max={max}
          rules={rules} // Pass rules down to InputGroup (like async validation)
          formatOnChange={formatOnChange}
          maxLength={maxLength}
          onChange={onChange}
          onBlur={handleBlur}
          readOnly={readOnly}
          inputClassName={inputClassName}
        />

        {fieldAction && type !== "password" && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {fieldAction}
          </div>
        )}

        {type === "password" && (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowPassword((prev) => !prev)}
            className={inputWithChangesStyles.toggleButton}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
/*
InputWithChanges
 ├─ render label
 ├─ positions change indicator
 └─ delegates input rendering
*/
