"use client";

import { use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  contactSchema,
  ContactFormInput,
} from "@/lib/validations/contact-schema";
import { upsertContactPEA } from "@/lib/actions/contact";
import { getFieldChanges, ChangeEntry } from "@/utils/formChanges";
import { registerWithOnBlurFormat } from "@/utils/formRegister";
import formatPostalCode from "@/utils/formatters/postalCode";
import formatPhone from "@/utils/formatters/phone";

import FormLayout from "@/components/form/form-layout";
import { SmartFormProvider } from "@/components/form/form-change-context";
import { EmployeeForm } from "@/components/employee/employee-form";

interface EditEmployeeFormProps {
  paramsPromise: Promise<{ id: string }>;
  initialData: ContactFormInput;
}

export default function EditEmployeeForm({
  paramsPromise,
  initialData,
}: EditEmployeeFormProps) {
  const params = use(paramsPromise);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    getValues,
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactSchema),
    values: initialData,
    shouldFocusError: false,
    mode: "onChange",
  });

  const currentValues = getValues();

  const registerFormatted = useMemo(
    () =>
      registerWithOnBlurFormat<ContactFormInput>(register, {
        postalCode: formatPostalCode,
        phone: formatPhone,
      }),
    [register],
  );

  const changes: ChangeEntry<unknown>[] = useMemo(
    () => getFieldChanges(initialData, currentValues, dirtyFields),
    [initialData, currentValues, dirtyFields],
  );

  const changeCount = changes.length;
  const [showChanges, setShowChanges] = useState(false);

  const onSave = async (data: ContactFormInput) => {
    try {
      const result = await upsertContactPEA(data, params.id);
      if (result.success && result.data?.id) {
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
          <EmployeeForm errors={errors} />
        </form>
      </SmartFormProvider>
    </FormLayout>
  );
}
