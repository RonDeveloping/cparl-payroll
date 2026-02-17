//components/form/password-input.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

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
    <div className="space-y-1 w-full">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
        <input
          {...registration}
          type={show ? "text" : "password"}
          placeholder={placeholder || ""}
          className={cn(
            "w-full pl-10 pr-12 py-2 border rounded-lg outline-none transition-all",
            error
              ? "border-red-500 focus:ring-red-200"
              : "border-slate-300 focus:ring-blue-500 focus:ring-2",
          )}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
