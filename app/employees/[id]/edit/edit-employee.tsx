"use client";
// app/employees/[id]/edit/edit-employee.tsx

import { use } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import {
  contactSchema,
  ContactFormInput,
} from "@/lib/validations/contact-schema";
import { upsertContactPEA } from "@/lib/actions/contact";
import { getFieldChanges, ChangeEntry, DirtyField } from "@/utils/formChanges";
import { registerWithOnBlurFormat } from "@/utils/formRegister";
import formatPostalCode from "@/utils/formatters/postalCode";
import formatPhone from "@/utils/formatters/phone";

import FormLayout from "@/components/form/form-layout";
import { SmartFormProvider } from "@/components/form/form-change-context";
import { EmployeeForm } from "@/components/employee/employee-form";

interface EditEmployeeFormProps {
  paramsPromise: Promise<{ id: string }>;
  initialData: ContactFormInput;
  bankAccountStatuses: readonly string[];
  tenantId?: string;
}

export default function EditEmployeeForm({
  paramsPromise,
  initialData,
  bankAccountStatuses,
  tenantId,
}: EditEmployeeFormProps) {
  const params = use(paramsPromise);
  const router = useRouter();
  const draftStorageKey = `employee-form-draft:${params.id}:${tenantId ?? "none"}`;

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactSchema) as never,
    values: initialData,
    shouldFocusError: false,
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    getValues,
    reset,
    control,
  } = form;

  useEffect(() => {
    try {
      const rawDraft = window.sessionStorage.getItem(draftStorageKey);
      if (!rawDraft) {
        return;
      }

      const parsedDraft = JSON.parse(rawDraft) as Partial<ContactFormInput>;
      reset(
        {
          ...initialData,
          ...parsedDraft,
        },
        { keepDefaultValues: true },
      );
    } catch {
      // Ignore storage access or parsing errors.
    }
  }, [draftStorageKey, initialData, reset]);

  const currentValues = getValues();
  const watchedValues = useWatch({ control });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        draftStorageKey,
        JSON.stringify(watchedValues),
      );
    } catch {
      // Ignore storage access errors.
    }
  }, [draftStorageKey, watchedValues]);

  const registerFormatted = useMemo(
    () =>
      registerWithOnBlurFormat<ContactFormInput>(register, {
        postalCode: formatPostalCode,
        phone: formatPhone,
      }),
    [register],
  );

  const changes: ChangeEntry<unknown>[] = useMemo(
    () =>
      getFieldChanges(
        initialData,
        currentValues,
        dirtyFields as unknown as Record<string, DirtyField>,
      ),
    [initialData, currentValues, dirtyFields],
  );

  const changeCount = changes.length;
  const [showChanges, setShowChanges] = useState(false);

  const onSave = async (data: ContactFormInput) => {
    try {
      const result = await upsertContactPEA(data, params.id, tenantId);
      if (result.success && result.data?.id) {
        try {
          window.sessionStorage.removeItem(draftStorageKey);
        } catch {
          // Ignore storage access errors.
        }
        router.refresh();
        router.push(`/employees`);
      } else if (!result.success) {
        alert(result.error || "Changes not saved; please check for errors.");
      }
    } catch (error) {
      console.error("Form submission failed", error);
      alert("Changes not saved; please check for errors.");
    }
  };

  return (
    <FormLayout
      domain="employees"
      id={params.id}
      formId="employee-form"
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      changeLabel="Employee Info"
      changeCount={changeCount}
      showChanges={showChanges}
      onEyeToggle={() => setShowChanges((v) => !v)}
    >
      <FormProvider {...form}>
        <SmartFormProvider<ContactFormInput>
          value={{
            register: registerFormatted,
            changes,
            showChanges,
          }}
        >
          <form
            id="employee-form"
            onSubmit={handleSubmit(onSave)}
            className="space-y-4"
          >
            <EmployeeForm
              errors={errors}
              bankAccountStatuses={bankAccountStatuses}
            />
          </form>
        </SmartFormProvider>
      </FormProvider>
    </FormLayout>
  );
}
