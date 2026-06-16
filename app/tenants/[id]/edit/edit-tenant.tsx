"use client";
// app/tenants/[id]/edit/edit-tenant.tsx

import { use } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

import { tenantSchema, TenantFormInput } from "@/lib/validations/tenant-schema";
import { upsertTenant } from "@/lib/actions/tenant";
import { getFieldChanges, ChangeEntry } from "@/utils/formChanges";
import { getPostalLocationSuggestion } from "@/utils/validators/postalCodeLookup";

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
  const draftStorageKey = `tenant-form-draft:${params.id}`;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    getValues,
    reset,
    control,
    setValue,
  } = useForm<TenantFormInput>({
    resolver: zodResolver(tenantSchema),
    values: initialData,
    shouldFocusError: false,
    mode: "onBlur",
  });

  useEffect(() => {
    try {
      const rawDraft = window.sessionStorage.getItem(draftStorageKey);
      if (!rawDraft) {
        return;
      }

      const parsedDraft = JSON.parse(rawDraft) as Partial<TenantFormInput>;
      reset(
        {
          ...initialData,
          ...parsedDraft,
          address: {
            ...initialData.address,
            ...(parsedDraft.address ?? {}),
          },
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

  const changes: ChangeEntry<unknown>[] = useMemo(
    () => getFieldChanges(initialData, currentValues, dirtyFields),
    [initialData, currentValues, dirtyFields],
  );

  const changeCount = changes.length;
  const [showChanges, setShowChanges] = useState(false);

  const applyPostalCodeSuggestion = () => {
    const suggestion = getPostalLocationSuggestion(
      getValues("address.postalCode"),
    );
    if (!suggestion) return;

    if (suggestion.provinceCode) {
      const currentProvince = (getValues("address.province") || "")
        .trim()
        .toUpperCase();
      if (currentProvince !== suggestion.provinceCode) {
        setValue("address.province", suggestion.provinceCode, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    }

    if (suggestion.city) {
      const currentCity = (getValues("address.city") || "").trim();
      if (currentCity.toLowerCase() !== suggestion.city.toLowerCase()) {
        setValue("address.city", suggestion.city, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    }
  };

  const handlePostalCodeChange = () => {
    applyPostalCodeSuggestion();
  };

  const handlePostalCodeBlur = () => {
    applyPostalCodeSuggestion();
  };

  const onSave = async (data: TenantFormInput) => {
    try {
      const result = await upsertTenant(data, params.id);
      if (result.success && result.data?.id) {
        try {
          window.sessionStorage.removeItem(draftStorageKey);
        } catch {
          // Ignore storage access errors.
        }
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
      changeLabel="Employer Info"
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
          <TenantForm
            errors={errors}
            showMembership={isNew}
            onPostalCodeChange={handlePostalCodeChange}
            onPostalCodeBlur={handlePostalCodeBlur}
          />
        </form>
      </SmartFormProvider>
    </FormLayout>
  );
}
