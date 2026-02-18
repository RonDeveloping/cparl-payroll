// components/form/InputWithChanges.tsx
"use client";
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
  rules?: RegisterOptions<TFormValues, Path<TFormValues>>;
}

export default function InputWithChanges<TFormValues extends FieldValues>({
  label,
  name,
  error,
  placeholder,
  type = "text",
  rules,
}: InputWithChangesProps<TFormValues>) {
  const [showPassword, setShowPassword] = useState(false);
  const { changes, showChanges, register } =
    useFormChangeContext<TFormValues>();

  // find if this input field changed
  const change = changes.find((c) => c.name === name);
  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className={inputWithChangesStyles.wrapper}>
      <div className={inputWithChangesStyles.headerRow}>
        <CapLabel>{label}</CapLabel>
        {/* Change indicator */}
        {showChanges && change && (
          <span className={inputWithChangesStyles.changeText}>
            {String(change.before)}
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
          rules={rules} // Pass rules down to InputGroup (like async validation)
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
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
