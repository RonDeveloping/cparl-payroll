//components/form/password-input.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { passwordInputStyles } from "@/constants/styles";

interface PasswordInputProps {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
  placeholder?: string;
}

export function PasswordInput({
  label,
  error,
  registration,
  placeholder,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className={passwordInputStyles.wrapper}>
      <label className={passwordInputStyles.label}>{label}</label>
      <div className={passwordInputStyles.inputWrapper}>
        <Lock className={passwordInputStyles.lockIcon} size={18} />
        <input
          {...registration}
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
