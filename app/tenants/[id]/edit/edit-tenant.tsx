"use client";
// app/tenants/[id]/edit/edit-tenant.tsx

import { use } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react";

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
  const OPEN_TILE_STATE_KEY = "dashboard:open-tile";
  const PROFILE_EDIT_STATE_KEY = "dashboard:profile-editing";
  const params = use(paramsPromise);
  const router = useRouter();
  const isNew = params.id === "new";
  const draftStorageKey = `tenant-form-draft:${params.id}`;
  const shouldAutoSyncOperatingNameRef = useRef(
    !String(initialData.operatingName ?? "").trim(),
  );
  const initialValues: TenantFormInput = useMemo(
    () => ({
      ...initialData,
      payFrequency: initialData.payFrequency ?? "MONTHLY",
    }),
    [initialData],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    getValues,
    reset,
    control,
    setValue,
  } = useForm<TenantFormInput>({
    resolver: zodResolver(tenantSchema) as never,
    values: initialValues,
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
      const mergedOperatingName = String(
        parsedDraft.operatingName ?? initialData.operatingName ?? "",
      ).trim();
      shouldAutoSyncOperatingNameRef.current = mergedOperatingName.length === 0;

      reset(
        {
          ...initialValues,
          ...parsedDraft,
          address: {
            ...initialValues.address,
            ...(parsedDraft.address ?? {}),
          },
        },
        { keepDefaultValues: true },
      );
    } catch {
      // Ignore storage access or parsing errors.
    }
  }, [draftStorageKey, initialValues, reset]);

  const currentValues = getValues();
  const watchedValues = useWatch({ control });
  const watchedCoreName = useWatch({ control, name: "coreName" });
  const watchedOperatingName = useWatch({ control, name: "operatingName" });
  const watchedPayFrequency = useWatch({ control, name: "payFrequency" });

  useEffect(() => {
    // Once user edits DBA, stop auto-sync and preserve their explicit value.
    if (dirtyFields.operatingName) {
      shouldAutoSyncOperatingNameRef.current = false;
      return;
    }

    if (!shouldAutoSyncOperatingNameRef.current) {
      return;
    }

    const legalName = (watchedCoreName || "").trim();

    if (!legalName) {
      return;
    }

    if ((watchedOperatingName || "") === (watchedCoreName || "")) {
      return;
    }

    setValue("operatingName", watchedCoreName, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [
    dirtyFields.operatingName,
    setValue,
    watchedCoreName,
    watchedOperatingName,
  ]);

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

  const onSave = async (data: TenantFormInput) => {
    try {
      const result = await upsertTenant(data, params.id);
      if (result.success && result.data?.id) {
        try {
          window.sessionStorage.removeItem(draftStorageKey);
          if (isNew) {
            window.sessionStorage.setItem(OPEN_TILE_STATE_KEY, "organizations");
            window.sessionStorage.removeItem(PROFILE_EDIT_STATE_KEY);
          }
        } catch {
          // Ignore storage access errors.
        }
        router.refresh();
        router.push(isNew ? `/dashboard` : `/tenants`);
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
            payFrequency={watchedPayFrequency}
            getFieldValue={(fieldName) => getValues(fieldName)}
            setFieldValue={(fieldName, value) =>
              setValue(fieldName, value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          />
        </form>
      </SmartFormProvider>
    </FormLayout>
  );
}
