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
    <div className={inputGroupStyles.wrapper}>
      <input
        {...register(name, rules)}
        type={type}
        placeholder={placeholder}
        className={cn(
          inputGroupStyles.inputBase,
          error ? inputGroupStyles.inputError : inputGroupStyles.inputDefault,
        )}
      />
      {error && <span className={inputGroupStyles.errorText}>{error}</span>}
    </div>
  );
}
/*
InputGroup
 └─ renders input & error
*/
