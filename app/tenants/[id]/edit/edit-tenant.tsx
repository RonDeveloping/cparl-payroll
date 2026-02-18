// app/tenants/[id]/edit/edit-tenant.tsx
"use client";

import { use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import { tenantSchema, TenantFormInput } from "@/lib/validations/tenant-schema";
import { upsertTenant } from "@/lib/actions/tenant";
import { getFieldChanges, ChangeEntry } from "@/utils/formChanges";

import FormLayout from "@/components/form/form-layout";
import { SmartFormProvider } from "@/components/form/form-change-context";
import { TenantForm } from "@/components/tenant/tenant-form";

interface EditTenantFormProps {
  paramsPromise: Promise<{ id: string }>;
  initialData: TenantFormInput;
}

export default function EditTenantForm({
  paramsPromise,
  initialData,
}: EditTenantFormProps) {
  const params = use(paramsPromise);
  const router = useRouter();
  const isNew = params.id === "new";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    getValues,
  } = useForm<TenantFormInput>({
    resolver: zodResolver(tenantSchema),
    values: initialData,
    shouldFocusError: false,
    mode: "onBlur",
  });

  const currentValues = getValues();

  const changes: ChangeEntry<unknown>[] = useMemo(
    () => getFieldChanges(initialData, currentValues, dirtyFields),
    [initialData, currentValues, dirtyFields],
  );

  const changeCount = changes.length;
  const [showChanges, setShowChanges] = useState(false);

  const onSave = async (data: TenantFormInput) => {
    try {
      const result = await upsertTenant(data, params.id);
      if (result.success && result.data?.id) {
        router.refresh();
        router.push(`/tenants`);
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
      domain="tenants"
      id={params.id}
      formId="tenant-form"
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      changeLabel="Change(s) on the Tenant Form"
      changeCount={changeCount}
      showChanges={showChanges}
      onEyeToggle={() => setShowChanges((v) => !v)}
    >
      <SmartFormProvider<TenantFormInput>
        value={{
          register,
          changes,
          showChanges,
        }}
      >
        <form
          id="tenant-form"
          onSubmit={handleSubmit(onSave)}
          className="space-y-4"
        >
          <TenantForm errors={errors} showMembership={isNew} />
        </form>
      </SmartFormProvider>
    </FormLayout>
  );
}
