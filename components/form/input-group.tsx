import React, { useState } from "react";
import {
  FieldValues,
  Path,
  UseFormRegister,
  RegisterOptions,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { inputGroupStyles } from "@/constants/styles";

const assignInputRef = <T,>(ref: React.Ref<T> | undefined, value: T | null) => {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  (ref as React.MutableRefObject<T | null>).current = value;
};

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
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  maxLength?: number;
  value?: string;
  overlay?: React.ReactNode;
  overlayClassName?: string;
  inputClassName?: string;
  floatingPlaceholder?: string;
  iconPosition?: "left" | "right";
  inputRef?: React.Ref<HTMLInputElement>;
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
  onClick,
  icon,
  inputMode,
  autoComplete,
  maxLength,
  value,
  overlay,
  overlayClassName,
  inputClassName,
  floatingPlaceholder,
  iconPosition = "right",
  inputRef,
}: InputGroupProps<TFormValues>) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = typeof value === "string" && value.trim().length > 0;
  const isFloatingActive =
    Boolean(floatingPlaceholder) && (isFocused || hasValue);
  const registration = register(name, rules);

  return (
    <div className={inputGroupStyles.wrapper}>
      <div className="relative">
        {floatingPlaceholder && (
          <span
            className={cn(
              "pointer-events-none absolute transition-all duration-200",
              icon && iconPosition === "left" ? "left-14" : "left-5",
              isFloatingActive
                ? "top-1.5 text-[10px] font-semibold uppercase tracking-wide text-green-600"
                : "top-1/2 -translate-y-1/2 text-sm text-slate-400",
            )}
          >
            {floatingPlaceholder}
          </span>
        )}
        {overlay && (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center text-sm whitespace-pre",
              icon && iconPosition === "left" ? "pl-14 pr-5" : "px-5 pr-10",
              floatingPlaceholder && "pt-3",
              overlayClassName,
            )}
          >
            {overlay}
          </div>
        )}
        <input
          {...registration}
          ref={(element) => {
            registration.ref(element);
            assignInputRef(inputRef, element);
          }}
          type={type}
          placeholder={floatingPlaceholder ? " " : placeholder}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            registration.onBlur(e);
          }}
          onChange={(e) => {
            registration.onChange(e);
            onChange?.(e);
          }}
          onClick={onClick}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          value={value}
          className={cn(
            inputGroupStyles.inputBase,
            error ? inputGroupStyles.inputError : inputGroupStyles.inputDefault,
            icon && iconPosition === "right" && "pr-10",
            icon && iconPosition === "left" && "pl-14",
            overlay && "text-transparent caret-slate-900",
            floatingPlaceholder && "pt-5 pb-1.5",
            inputClassName,
          )}
        />
        {icon && (
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none",
              iconPosition === "left" ? "left-3" : "right-3",
            )}
          >
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
