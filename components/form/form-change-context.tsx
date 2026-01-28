///components/form/FormChangeContext.tsx

"use client";

import { createContext, useContext } from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";
import { ChangeEntry } from "@/utils/formChanges";

interface FormChangeContextValue {
  changes: ChangeEntry<unknown>[];
  showChanges: boolean;
  register: UseFormRegister<FieldValues>;
}

const FormChangeContext = createContext<FormChangeContextValue | null>(null);

export function useFormChangeContext<TFormValues extends FieldValues>() {
  const ctx = useContext(FormChangeContext);
  if (!ctx) {
    throw new Error(
      "InputWithChanges must be used within a <SmartFormProvider>",
    );
  }
  return ctx as {
    changes: ChangeEntry<unknown>[];
    showChanges: boolean;
    register: UseFormRegister<TFormValues>;
  };
}

export function SmartFormProvider<TFormValues extends FieldValues>({
  value,
  children,
}: {
  value: {
    changes: ChangeEntry<unknown>[];
    showChanges: boolean;
    register: UseFormRegister<TFormValues>;
  };
  children: React.ReactNode;
}) {
  return (
    <FormChangeContext.Provider value={value as FormChangeContextValue}>
      {children}
    </FormChangeContext.Provider>
  );
}
/*
FormChangeProvider   ← Supplies register, changes, showChanges
 └─ FormLayout       ← layout + actions + back/save logic
 └─ InputWithChanges   ← change logic, context, diff display
     └─ InputGroup     ← actual input + RHF register
*/
