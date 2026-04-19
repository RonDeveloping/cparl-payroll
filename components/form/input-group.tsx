import React from "react";
import {
  FieldValues,
  Path,
  UseFormRegister,
  RegisterOptions,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { inputGroupStyles } from "@/constants/styles";

interface InputGroupProps<TFormValues extends FieldValues> {
  // label: React.ReactNode; //for accessibility, use ReactNode to allow more complex labels, not just string, such as clarfication icons.
  name: Path<TFormValues>;
  register: UseFormRegister<TFormValues>;
  error?: string;
  placeholder?: string;
  type?: string;
  rules?: RegisterOptions<TFormValues, Path<TFormValues>>;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  maxLength?: number;
  value?: string;
  overlay?: React.ReactNode;
}

export default function InputGroup<TFormValues extends FieldValues>({
  // label,
  name,
  register,
  error,
  placeholder,
  type = "text",
  rules,
  onFocus,
  onChange,
  icon,
  inputMode,
  autoComplete,
  maxLength,
  value,
  overlay,
}: InputGroupProps<TFormValues>) {
  return (
    <div className={inputGroupStyles.wrapper}>
      <div className="relative">
        {overlay && (
          <div className="pointer-events-none absolute inset-0 flex items-center px-5 pr-10 text-sm whitespace-pre">
            {overlay}
          </div>
        )}
        <input
          {...register(name, rules)}
          type={type}
          placeholder={placeholder}
          onFocus={onFocus}
          onChange={onChange}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          value={value}
          className={cn(
            inputGroupStyles.inputBase,
            error ? inputGroupStyles.inputError : inputGroupStyles.inputDefault,
            icon && "pr-10",
            overlay && "text-transparent caret-slate-900",
          )}
        />
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      {error && <span className={inputGroupStyles.errorText}>{error}</span>}
    </div>
  );
}
/*
InputGroup
 └─ renders input & error
*/
