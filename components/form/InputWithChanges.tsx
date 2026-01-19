// components/form/InputWithChanges.tsx
"use client";

import { FieldValues, Path } from "react-hook-form";
import InputGroup from "./InputGroup";
// import { ChangeEntry } from "@/utils/formChanges";
import { useFormChangeContext } from "./FormChangeContext";

export interface InputWithChangesProps<TFormValues extends FieldValues> {
  label: React.ReactNode;
  name: Path<TFormValues>;
  // name: keyof TFormValues & string;
  // register: UseFormRegister<T>;
  error?: string;
  placeholder?: string;
  // type?: string;

  /** change display */
  // changes: ChangeEntry<unknown>[];
  // showChanges: boolean;
}

export default function InputWithChanges<TFormValues extends FieldValues>({
  label,
  name,
  error,
  placeholder,
}: InputWithChangesProps<TFormValues>) {
  const { changes, showChanges, register } =
    useFormChangeContext<TFormValues>();

  // find if this input field changed
  const change = changes.find((c) => c.name === name);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
          {label}
        </label>
        {/* Change indicator */}
        {showChanges && change && (
          <span className="text-xs text-red-500 line-through text-right">
            {String(change.before)}
          </span>
        )}
      </div>

      {/* Input */}
      <InputGroup<TFormValues>
        name={name}
        register={register}
        // label={label}
        placeholder={placeholder}
        error={error}
      />
      {/* <input
        {...register(name as Path<TFormValues>)}
        placeholder={placeholder}
      /> */}
      {/* {error && <p className="text-red-500">{error}</p>} */}
      {/* <div className="flex items-baseline justify-between mb-1">
        <label className="text-sm font-medium text-slate-700">{label}</label> */}

      {/* <InputGroup<T> {...props} name={name} label={undefined} /> */}
    </div>
  );
}
/*
InputWithChanges
 ├─ render label
 ├─ positions change indicator
 └─ delegates input rendering
*/
