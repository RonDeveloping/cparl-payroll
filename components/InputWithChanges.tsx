// components/InputWithChanges.tsx
"use client";

import { FieldValues, Path, UseFormRegister } from "react-hook-form";
import InputGroup from "./InputGroup";
import { ChangeEntry } from "@/utils/formChanges";

export interface InputWithChangesProps<T extends FieldValues> {
  label: React.ReactNode;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: string;
  placeholder?: string;
  type?: string;

  /** change display */
  changes: ChangeEntry<unknown>[];
  showChanges: boolean;
}

export default function InputWithChanges<T extends FieldValues>({
  label,
  name,
  changes,
  showChanges,
  ...props
}: InputWithChangesProps<T>) {
  // find if this input field changed
  const change = changes.find((c) => c.name === name);

  return (
    <div>
      {/* Label row */}
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-sm font-medium text-slate-700">{label}</label>

        {showChanges && change && (
          <span className="text-xs text-red-500 line-through ml-2">
            {String(change.before)}
          </span>
        )}
      </div>

      {/* Input row */}
      <InputGroup<T> {...props} name={name} label={undefined} />
    </div>
  );
}
