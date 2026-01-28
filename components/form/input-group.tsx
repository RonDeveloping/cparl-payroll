import React from "react";
import {
  FieldValues,
  Path,
  UseFormRegister,
  RegisterOptions,
} from "react-hook-form";

interface InputGroupProps<TFormValues extends FieldValues> {
  // label: React.ReactNode; //for accessibility, use ReactNode to allow more complex labels, not just string, such as clarfication icons.
  name: Path<TFormValues>;
  register: UseFormRegister<TFormValues>;
  error?: string;
  placeholder?: string;
  type?: string;
  rules?: RegisterOptions<TFormValues, Path<TFormValues>>;
}

export default function InputGroup<TFormValues extends FieldValues>({
  // label,
  name,
  register,
  error,
  placeholder,
  type = "text",
  rules,
}: InputGroupProps<TFormValues>) {
  return (
    <div className="flex flex-col space-y-1">
      <input
        {...register(name, rules)}
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-lg border transition-all text-sm outline-none ${
          error
            ? "border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-200 focus:ring-2 focus:ring-blue-500"
        }`}
      />
      {error && (
        <span className="text-[10px] text-red-500 font-medium ml-1">
          {error}
        </span>
      )}
    </div>
  );
}
/*
InputGroup
 └─ renders input & error
*/
