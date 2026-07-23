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
import { type TimeOffBenchmarkDraft } from "@/constants/time-off-policies";
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
  earningCodeOptions: readonly {
    id: string;
    code: string;
    description: string;
    isHourly: boolean;
  }[];
  payrollUnitOptions: readonly {
    id: string;
    code: string;
    name: string;
    frequency: string | null;
    paydaySummary: string;
    periodEndSummary: string;
  }[];
  contributoryCodeOptions: readonly {
    id: string;
    code: string;
    description: string;
    employeeExcludedEarnings: string;
    employeeCapAmount: string | null;
    defaultDeductionAmount: string;
    defaultParticipationAmount: string;
  }[];
  timeOffBenchmarkDraft?: TimeOffBenchmarkDraft;
  tenantId?: string;
  employerName?: string;
}

function getPayPeriodsPerYear(frequency: string | null | undefined): number {
  const normalizedFrequency = (frequency || "").toUpperCase();

  if (normalizedFrequency === "WEEKLY") return 52;
  if (normalizedFrequency === "BIWEEKLY") return 26;
  if (normalizedFrequency === "SEMIMONTHLY") return 24;
  if (normalizedFrequency === "MONTHLY") return 12;

  return 1;
}

function toAnnualAmountString(
  value: string | null | undefined,
  divisor: number,
) {
  const normalized = String(value || "")
    .replace(/,/g, "")
    .trim();
  if (!normalized) return "";

  const numeric = Number.parseFloat(normalized);
  if (!Number.isFinite(numeric)) return "";

  const annual = numeric * (divisor > 0 ? divisor : 1);
  return annual.toFixed(2);
}

export default function EditEmployeeForm({
  paramsPromise,
  initialData,
  bankAccountStatuses,
  earningCodeOptions,
  payrollUnitOptions,
  contributoryCodeOptions,
  timeOffBenchmarkDraft,
  tenantId,
  employerName,
}: EditEmployeeFormProps) {
  const params = use(paramsPromise);
  const router = useRouter();
  const draftStorageKey = `employee-form-draft:${params.id}:${tenantId ?? "none"}`;
  const changeSuffix =
    params.id === "new" && employerName ? `of ${employerName}` : undefined;
  const changeSuffixHref =
    params.id === "new" && tenantId
      ? `/payroll?tenantId=${tenantId}`
      : undefined;

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactSchema) as never,
    values: initialData,
    shouldFocusError: false,
    mode: "onBlur",
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
        emergencyContactPhone: formatPhone,
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
      const selectedPayrollUnitFrequency =
        payrollUnitOptions.find((option) => option.id === data.payrollUnitId)
          ?.frequency ?? null;
      const payPeriodsPerYear = getPayPeriodsPerYear(
        selectedPayrollUnitFrequency,
      );

      const dataForSave: ContactFormInput = {
        ...data,
        contributorySelections: (data.contributorySelections || []).map(
          (selection) => ({
            ...selection,
            deductionAmount: toAnnualAmountString(
              selection.deductionAmount,
              payPeriodsPerYear,
            ),
            participationAmount: toAnnualAmountString(
              selection.participationAmount,
              payPeriodsPerYear,
            ),
          }),
        ),
      };

      const result = await upsertContactPEA(dataForSave, params.id, tenantId);
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
      changeSuffix={changeSuffix}
      changeSuffixHref={changeSuffixHref}
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
              earningCodeOptions={earningCodeOptions}
              payrollUnitOptions={payrollUnitOptions}
              contributoryCodeOptions={contributoryCodeOptions}
              timeOffBenchmarkDraft={timeOffBenchmarkDraft}
            />
          </form>
        </SmartFormProvider>
      </FormProvider>
    </FormLayout>
  );
}
