"use client";
// components/form/password-input.tsx


import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { passwordInputStyles } from "@/constants/styles";

interface PasswordInputProps {
  label: string;
  error?: string;
  registration?: UseFormRegisterReturn;
  name?: string;
  required?: boolean;
  className?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
}

export function PasswordInput({
  label,
  error,
  registration,
  name,
  required,
  className,
  onBlur,
  placeholder,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    if (show) {
      setShow(false);
    }
    registration?.onBlur(e);
    onBlur?.(e);
  };

  return (
    <div className={cn(passwordInputStyles.wrapper, className)}>
      <label className={passwordInputStyles.label}>{label}</label>
      <div className={passwordInputStyles.inputWrapper}>
        <Lock className={passwordInputStyles.lockIcon} size={18} />
        <input
          {...registration}
          name={registration?.name ?? name}
          required={required}
          onBlur={handleBlur}
          type={show ? "text" : "password"}
          placeholder={placeholder || ""}
          className={cn(
            passwordInputStyles.inputBase,
            error
              ? passwordInputStyles.inputError
              : passwordInputStyles.inputDefault,
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShow(!show)}
          className={passwordInputStyles.toggleButton}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className={passwordInputStyles.errorText}>{error}</p>}
    </div>
  );
}
