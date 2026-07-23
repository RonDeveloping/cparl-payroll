"use client";
// components/employee/employee-form.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FieldErrors,
  Path,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { ContactFormInput } from "@/lib/validations/contact-schema";
import FormSection from "@/components/form/form-section";
import InputWithChanges from "@/components/form/input-with-changes";
import CustomDatePickerWithChanges from "@/components/form/custom-date-picker-with-changes";
import SelectWithChanges from "@/components/form/select-with-changes";
import SectionDisclosure from "@/components/section-disclosure";
import { FormGrid } from "@/components/form/form-grid";
import { Clarification } from "@/components/clarification";
import { CapLabel } from "@/components/shared/cap-label";
import formatSIN from "@/utils/formatters/sin";
import formatPostalCode from "@/utils/formatters/postalCode";
import { IDENTITY_FIELDS } from "@/constants/contact-fields";
import {
  MailingAddressSection,
  type MailingAddressField,
} from "../shared/mailing-address-section";
import { cn } from "@/lib/utils";
import { CANADA_PROVINCE_TERRITORY_OPTIONS } from "@/constants/canada-provinces";
import { employeeFieldContent } from "@/constants/content";
import { inputWithChangesStyles } from "@/constants/styles";
import {
  getPostalCodeProgress,
  type PostalCodeProgressTone,
} from "@/utils/validators/postalCodeProgress";
import {
  getInstitutionBadgeClass,
  getInstitutionShortName,
} from "@/constants/financial-institutions";
import {
  ACCRUAL_FREQUENCY_OPTIONS,
  ACCRUAL_RATE_CLARIFICATION,
  HOUR_CAP_CLARIFICATION,
  normalizeTimeOffBenchmarkDraft,
  parseOptionalTimeOffNumber,
  TIME_OFF_ROWS,
  type TimeOffBenchmarkDraft,
  VACATION_POLICY_CLARIFICATION,
} from "@/constants/time-off-policies";

interface EmployeeFormProps {
  errors: FieldErrors<ContactFormInput>;
  bankAccountStatuses?: readonly string[];
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
}

const MAX_BANK_ACCOUNTS = 10;

const EMPLOYEE_ADDRESS_FIELDS: MailingAddressField<ContactFormInput>[] = [
  {
    label: "Street",
    name: "street",
    rules: {},
  },
  {
    label: "Postal code",
    name: "postalCode",
    rules: {},
    formatOnChange: formatPostalCode,
  },
  {
    label: "City",
    name: "city",
    rules: {},
  },
  {
    label: "Province",
    name: "province",
    rules: {},
  },
];

const formatInstitutionInput = (value: string) =>
  value.replace(/\D/g, "").slice(0, 3);

const formatTransitAccountInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 17);
  const branch = digits.slice(0, 5);
  const account = digits.slice(5, 17);
  return [branch, account].filter(Boolean).join("-");
};

const formatAccountingInput = (value: string) => {
  const cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return "";

  const hasDecimal = cleaned.includes(".");
  const [rawInteger, rawFraction = ""] = cleaned.split(".");
  const integerPart = (rawInteger || "0").replace(/^0+(\d)/, "$1");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fractionPart = rawFraction.slice(0, 2);

  return hasDecimal ? `${groupedInteger}.${fractionPart}` : groupedInteger;
};

const formatAccountingOnBlur = (value: string) => {
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) return "";
  const numeric = Number.parseFloat(normalized);
  if (Number.isNaN(numeric)) return "";
  return numeric.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatAmountForDisplay = (value: string | null | undefined) => {
  if (!value) return "-";
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) return "-";

  const numeric = Number.parseFloat(normalized);
  if (Number.isNaN(numeric)) return "-";

  return numeric.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getPayPeriodsPerYear = (frequency: string | null | undefined): number => {
  const normalizedFrequency = (frequency || "").toUpperCase();

  if (normalizedFrequency === "WEEKLY") return 52;
  if (normalizedFrequency === "BIWEEKLY") return 26;
  if (normalizedFrequency === "SEMIMONTHLY") return 24;
  if (normalizedFrequency === "MONTHLY") return 12;

  return 1;
};

const formatPerPayAmount = (
  annualAmount: string | null | undefined,
  payPeriodsPerYear: number,
) => {
  const normalized = String(annualAmount || "")
    .replace(/,/g, "")
    .trim();
  if (!normalized) return "";

  const numeric = Number.parseFloat(normalized);
  if (!Number.isFinite(numeric)) return "";

  const perPay = numeric / (payPeriodsPerYear > 0 ? payPeriodsPerYear : 1);
  return perPay.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const normalizePercentageOnBlur = (value: string) => {
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) return "";

  const numeric = Number.parseFloat(normalized);
  if (Number.isNaN(numeric)) return "";

  const clamped = Math.min(Math.max(numeric, 0), 100);
  return Number.isInteger(clamped)
    ? String(clamped)
    : String(Number(clamped.toFixed(2)));
};

const VERIFICATION_BADGE: Record<string, { label: string; className: string }> =
  {
    UNVERIFIED: {
      label: "Unverified",
      className: "bg-slate-100 text-slate-500",
    },
    PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700" },
    VERIFIED: {
      label: "Verified",
      className: "bg-emerald-100 text-emerald-700",
    },
    FAILED: { label: "Failed", className: "bg-red-100 text-red-600" },
  };

const WITHHOLDING_EXEMPTION_OPTIONS = [
  { value: "tax", label: "Tax" },
  { value: "cpp", label: "CPP" },
  { value: "ei", label: "EI" },
] as const;

const Earnings_SECTION_CLARIFICATION =
  "It does not include employer matching portions for contributory items that are set up in the next section.";

const CONTRIBUTORY_SECTION_CLARIFICATION =
  "Pick contributory codes for this employee and adjust employee deduction/employer participation amounts as needed.";

const CONTRIBUTORY_CODE_COLUMN_CLARIFICATION =
  "This code links to excluded earnings, annual limit, tax-at-source treatment, and reporting mapping.";

const CONTRIBUTORY_DEDUCTION_COLUMN_CLARIFICATION =
  "Based on the contributory type: for Per hour worked, use dollars per hour; for Percent of gross pay, use a percentage. Use this field to customize the employee deduction for this employee.";

const CONTRIBUTORY_PARTICIPATION_COLUMN_CLARIFICATION =
  "Based on the contributory type: for Per hour worked, use dollars per hour; for Percent of gross pay, use a percentage. Use this field to customize the employer participation for this employee.";

function parseWithholdingExemptions(value: string | undefined) {
  if (!value) {
    return new Set<string>();
  }

  return new Set(
    value
      .split(/[\s,;|/]+/)
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean),
  );
}

function BankAccountRow({
  index,
  register,
  setValue,
  getValues,
  errors,
  verificationStatus = "UNVERIFIED",
}: {
  index: number;
  register: UseFormRegister<ContactFormInput>;
  setValue: UseFormSetValue<ContactFormInput>;
  getValues: UseFormGetValues<ContactFormInput>;
  errors: FieldErrors<ContactFormInput>;
  verificationStatus?: string;
}) {
  const institutionRegistration = register(
    `bankAccounts.${index}.institutionNumber` as const,
  );
  const bankDetailsRegistration = register(
    `bankAccounts.${index}.bankDetails` as const,
  );
  const distributionTypeRegistration = register(
    `bankAccounts.${index}.distributionType` as const,
  );
  const distributionValueRegistration = register(
    `bankAccounts.${index}.distributionValue` as const,
  );
  const institutionNumber = useWatch({
    name: `bankAccounts.${index}.institutionNumber` as const,
  });
  const distributionType = useWatch({
    name: `bankAccounts.${index}.distributionType` as const,
  });
  const bankLabel = getInstitutionShortName(institutionNumber || "");

  return (
    <div className="grid w-full grid-cols-[2rem_6rem_12rem_8rem_6rem_6rem] items-start gap-2 px-3 py-2">
      <div className="flex h-10 items-center justify-center text-sm font-semibold text-slate-400">
        {index + 1}
      </div>

      <div>
        <div className="relative">
          <input
            {...institutionRegistration}
            placeholder="123"
            aria-label="Bank number"
            inputMode="numeric"
            maxLength={3}
            onChange={(e) => {
              e.target.value = formatInstitutionInput(e.target.value);
              institutionRegistration.onChange(e);
            }}
            className={cn(
              "w-full rounded-md border px-3 py-2 pr-14 text-sm placeholder:text-slate-400",
              errors.bankAccounts?.[index]?.institutionNumber?.message
                ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                : "border-slate-300",
            )}
          />
          {bankLabel && (
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 right-2 flex items-center text-[8px] font-medium uppercase tracking-[0.04em]",
                getInstitutionBadgeClass(institutionNumber || ""),
              )}
            >
              {bankLabel}
            </div>
          )}
        </div>
        {errors.bankAccounts?.[index]?.institutionNumber?.message && (
          <p className="mt-1 text-xs text-red-600">
            {errors.bankAccounts[index]?.institutionNumber?.message}
          </p>
        )}
      </div>

      <div>
        <input
          {...bankDetailsRegistration}
          placeholder="12345-1234567"
          aria-label="Branch number and account number"
          inputMode="numeric"
          maxLength={18}
          onChange={(e) => {
            e.target.value = formatTransitAccountInput(e.target.value);
            bankDetailsRegistration.onChange(e);
          }}
          className={cn(
            "w-full rounded-md border px-3 py-2 text-center text-sm placeholder:text-slate-400",
            errors.bankAccounts?.[index]?.bankDetails?.message
              ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
              : "border-slate-300",
          )}
        />
        {errors.bankAccounts?.[index]?.bankDetails?.message && (
          <p className="mt-1 text-xs text-red-600">
            {errors.bankAccounts[index]?.bankDetails?.message}
          </p>
        )}
      </div>

      <div>
        <select
          {...distributionTypeRegistration}
          onBlur={(e) => {
            const valuePath =
              `bankAccounts.${index}.distributionValue` as const;
            const currentValue = getValues(valuePath) || "";
            const selectedType = e.target.value;

            let normalizedValue = currentValue;
            if (selectedType === "FIXED_AMOUNT") {
              normalizedValue = formatAccountingOnBlur(currentValue);
            } else if (selectedType === "PERCENTAGE") {
              normalizedValue = normalizePercentageOnBlur(currentValue);
            }

            if (normalizedValue !== currentValue) {
              setValue(valuePath, normalizedValue, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }

            distributionTypeRegistration.onBlur(e);
          }}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value=""></option>
          <option value="FIXED_AMOUNT">Fixed Amount</option>
          <option value="PERCENTAGE">Percentage</option>
          <option value="REMAINDER">Remainder</option>
        </select>
        {errors.bankAccounts?.[index]?.distributionType?.message && (
          <p className="mt-1 text-xs text-red-600">
            {errors.bankAccounts[index]?.distributionType?.message}
          </p>
        )}
      </div>

      <div className="pr-1">
        <input
          {...distributionValueRegistration}
          placeholder="500.00 or 50"
          onChange={(e) => {
            if (distributionType === "FIXED_AMOUNT") {
              e.target.value = formatAccountingInput(e.target.value);
            }
            distributionValueRegistration.onChange(e);
          }}
          onBlur={(e) => {
            if (distributionType === "FIXED_AMOUNT") {
              e.target.value = formatAccountingOnBlur(e.target.value);
            }
            distributionValueRegistration.onBlur(e);
          }}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-center text-sm placeholder:text-slate-400"
        />
        {errors.bankAccounts?.[index]?.distributionValue?.message && (
          <p className="mt-1 text-xs text-red-600">
            {errors.bankAccounts[index]?.distributionValue?.message}
          </p>
        )}
      </div>

      <div className="flex h-10 items-center justify-start pl-1">
        {(() => {
          const badge =
            VERIFICATION_BADGE[verificationStatus] ??
            VERIFICATION_BADGE.UNVERIFIED;
          return (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                badge.className,
              )}
            >
              {badge.label}
            </span>
          );
        })()}
      </div>
    </div>
  );
}

export function EmployeeForm({
  errors,
  bankAccountStatuses = [],
  earningCodeOptions,
  payrollUnitOptions,
  contributoryCodeOptions,
  timeOffBenchmarkDraft,
}: EmployeeFormProps) {
  const {
    register,
    setValue,
    getValues,
    formState: { submitCount },
  } = useFormContext<ContactFormInput>();
  const shouldRunTimeOffValidation = submitCount > 0;
  const [postalProgress, setPostalProgress] = useState<{
    text: string;
    tone: PostalCodeProgressTone;
  }>({
    text: "",
    tone: "neutral",
  });
  const [showOptionalIdentification, setShowOptionalIdentification] =
    useState(false);
  const [showOptionalEmployment, setShowOptionalEmployment] = useState(false);
  const normalizedTimeOffBenchmarkDraft = normalizeTimeOffBenchmarkDraft(
    timeOffBenchmarkDraft,
  );
  const [timeOffAccrualFrequency, setTimeOffAccrualFrequency] = useState<
    Record<(typeof TIME_OFF_ROWS)[number]["accrualRateName"], string>
  >({
    vacationTimeOff: normalizedTimeOffBenchmarkDraft.frequency.vacationTimeOff,
    sickTimeOff: normalizedTimeOffBenchmarkDraft.frequency.sickTimeOff,
    personalTimeOff: normalizedTimeOffBenchmarkDraft.frequency.personalTimeOff,
  });
  const [timeOffHoursPerYear, setTimeOffHoursPerYear] = useState<
    Record<(typeof TIME_OFF_ROWS)[number]["accrualRateName"], string>
  >({
    vacationTimeOff:
      normalizedTimeOffBenchmarkDraft.annualAllowance.vacationTimeOff,
    sickTimeOff: normalizedTimeOffBenchmarkDraft.annualAllowance.sickTimeOff,
    personalTimeOff:
      normalizedTimeOffBenchmarkDraft.annualAllowance.personalTimeOff,
  });
  const [timeOffCappedAtHours, setTimeOffCappedAtHours] = useState<
    Record<(typeof TIME_OFF_ROWS)[number]["accrualRateName"], string>
  >({
    vacationTimeOff: normalizedTimeOffBenchmarkDraft.hourCap.vacationTimeOff,
    sickTimeOff: normalizedTimeOffBenchmarkDraft.hourCap.sickTimeOff,
    personalTimeOff: normalizedTimeOffBenchmarkDraft.hourCap.personalTimeOff,
  });
  const bankAccounts = (useWatch({ name: "bankAccounts" as const }) ||
    []) as ContactFormInput["bankAccounts"];
  const additionalEarnings = (useWatch({
    name: "additionalEarnings" as const,
  }) || []) as ContactFormInput["additionalEarnings"];
  const contributorySelections = (useWatch({
    name: "contributorySelections" as const,
  }) || []) as ContactFormInput["contributorySelections"];
  const exemptionsValue = useWatch({ name: "exemptions" as const });
  const jobEarningCodeIdValue = useWatch({ name: "jobEarningCodeId" as const });
  const selectedExemptions = useMemo(
    () => parseWithholdingExemptions(exemptionsValue),
    [exemptionsValue],
  );
  const statusValue = useWatch({ name: "status" as const });
  const payrollUnitIdValue = useWatch({ name: "payrollUnitId" as const });
  const selectedPayrollUnitOption = useMemo(
    () =>
      payrollUnitOptions.find((option) => option.id === payrollUnitIdValue) ||
      payrollUnitOptions[0] ||
      null,
    [payrollUnitIdValue, payrollUnitOptions],
  );
  const payPeriodsPerYear = useMemo(
    () => getPayPeriodsPerYear(selectedPayrollUnitOption?.frequency),
    [selectedPayrollUnitOption?.frequency],
  );
  const previousPayPeriodsRef = useRef<number | null>(null);

  useEffect(() => {
    if (previousPayPeriodsRef.current == null) {
      previousPayPeriodsRef.current = payPeriodsPerYear;
      return;
    }

    const previousPayPeriods = previousPayPeriodsRef.current;
    if (previousPayPeriods === payPeriodsPerYear) return;

    const selections = getValues("contributorySelections") || [];

    selections.forEach((selection, index) => {
      const recalculate = (rawValue: string | undefined) => {
        const normalized = String(rawValue || "")
          .replace(/,/g, "")
          .trim();
        if (!normalized) return "";

        const numeric = Number.parseFloat(normalized);
        if (!Number.isFinite(numeric)) return "";

        const annual =
          numeric * (previousPayPeriods > 0 ? previousPayPeriods : 1);
        const nextPerPay =
          annual / (payPeriodsPerYear > 0 ? payPeriodsPerYear : 1);

        return nextPerPay.toLocaleString("en-CA", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      setValue(
        `contributorySelections.${index}.deductionAmount` as const,
        recalculate(selection.deductionAmount),
        { shouldDirty: true, shouldValidate: true },
      );
      setValue(
        `contributorySelections.${index}.participationAmount` as const,
        recalculate(selection.participationAmount),
        { shouldDirty: true, shouldValidate: true },
      );
    });

    previousPayPeriodsRef.current = payPeriodsPerYear;
  }, [getValues, payPeriodsPerYear, setValue]);
  const [
    vacationTimeOffValue,
    sickTimeOffValue,
    personalTimeOffValue,
    middleNameValue,
    nickNameValue,
    prefixValue,
    suffixValue,
    displayNameValue,
    employeeNumberValue,
    employmentTitleValue,
    employmentDepartmentValue,
    jobStartDateValue,
    jobEndDateValue,
  ] = useWatch({
    name: [
      "vacationTimeOff",
      "sickTimeOff",
      "personalTimeOff",
      "middleName",
      "nickName",
      "prefix",
      "suffix",
      "displayName",
      "employeeNumber",
      "employmentTitle",
      "employmentDepartment",
      "jobStartDate",
      "jobEndDate",
    ],
  });
  const optionalIdentityFieldsExpanded = Boolean(
    errors.middleName?.message ||
    errors.nickName?.message ||
    errors.prefix?.message ||
    errors.suffix?.message ||
    errors.displayName?.message ||
    String(middleNameValue || "").trim() ||
    String(nickNameValue || "").trim() ||
    String(prefixValue || "").trim() ||
    String(suffixValue || "").trim() ||
    String(displayNameValue || "").trim(),
  );
  const optionalIdentificationExpanded =
    showOptionalIdentification || optionalIdentityFieldsExpanded;
  const showTerminationDetails = statusValue === "TERMINATED";
  const timeOffAccrualRateValues: Record<
    (typeof TIME_OFF_ROWS)[number]["accrualRateName"],
    string
  > = {
    vacationTimeOff: String(vacationTimeOffValue || ""),
    sickTimeOff: String(sickTimeOffValue || ""),
    personalTimeOff: String(personalTimeOffValue || ""),
  };
  const optionalEmploymentExpanded =
    showOptionalEmployment ||
    Boolean(
      errors.employeeNumber?.message ||
      errors.employmentTitle?.message ||
      errors.employmentDepartment?.message ||
      errors.jobStartDate?.message ||
      errors.jobEndDate?.message ||
      String(employeeNumberValue || "").trim() ||
      String(employmentTitleValue || "").trim() ||
      String(employmentDepartmentValue || "").trim() ||
      String(jobStartDateValue || "").trim() ||
      String(jobEndDateValue || "").trim(),
    );

  const addBankAccountRow = () => {
    const currentBankAccounts = getValues("bankAccounts") || [];
    if (currentBankAccounts.length >= MAX_BANK_ACCOUNTS) return;

    setValue(
      "bankAccounts",
      [
        ...currentBankAccounts,
        {
          id: "",
          institutionNumber: "",
          bankDetails: "",
          distributionType: undefined,
          distributionValue: "",
        },
      ],
      { shouldDirty: true },
    );
  };

  const addAdditionalEarningRow = () => {
    const currentAdditionalEarnings = getValues("additionalEarnings") || [];
    setValue(
      "additionalEarnings",
      [
        ...currentAdditionalEarnings,
        {
          jobEarningCodeId: "",
          jobPayRate: "",
          jobHoursPerWeek: "",
        },
      ],
      { shouldDirty: true },
    );
  };

  const addContributorySelectionRow = () => {
    const currentSelections = getValues("contributorySelections") || [];

    setValue(
      "contributorySelections",
      [
        ...currentSelections,
        {
          contributoryCodeId: "",
          deductionAmount: "",
          participationAmount: "",
        },
      ],
      { shouldDirty: true },
    );
  };

  const today = new Date();
  const maxDob = today.toISOString().slice(0, 10);
  const minDobDate = new Date(today);
  minDobDate.setFullYear(today.getFullYear() - 150);
  const minDob = minDobDate.toISOString().slice(0, 10);

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostalProgress(getPostalCodeProgress(e.target.value || ""));
  };

  const handlePostalCodeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setPostalProgress(getPostalCodeProgress(e.target.value || ""));
  };

  const hireDateValue = useWatch({ name: "hireDate" }) as string | undefined;
  const statusGuidance =
    statusValue === "TERMINATED"
      ? "Not included in payroll runs. Add termination details."
      : statusValue === "INACTIVE"
        ? "Not included in payroll runs."
        : null;
  const isFutureHireDate = hireDateValue
    ? new Date(hireDateValue + "T00:00:00Z") > new Date()
    : false;

  return (
    <>
      <FormSection title="Identification">
        <FormGrid>
          <InputWithChanges<ContactFormInput>
            label="Given name"
            name="givenName"
            rules={{ required: "Given name is required" }}
            error={errors.givenName?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="Family name"
            name="familyName"
            rules={{ required: "Family name is required" }}
            error={errors.familyName?.message}
          />
          <InputWithChanges<ContactFormInput>
            label={
              <Clarification
                term={employeeFieldContent.sin.term}
                description={employeeFieldContent.sin.description}
              />
            }
            name="sin"
            type="text"
            placeholder="123-456-789"
            maxLength={11}
            formatOnChange={formatSIN}
            rules={{}}
            error={errors.sin?.message}
          />
          <CustomDatePickerWithChanges<ContactFormInput>
            label={
              <Clarification
                term={employeeFieldContent.dob.term}
                description={employeeFieldContent.dob.description}
              />
            }
            name="dob"
            minDate={minDob}
            maxDate={maxDob}
            error={errors.dob?.message}
          />
        </FormGrid>

        <SectionDisclosure
          label="Optional"
          expanded={optionalIdentificationExpanded}
          onToggle={() => setShowOptionalIdentification((v) => !v)}
        />

        <div
          inert={!optionalIdentificationExpanded}
          aria-hidden={!optionalIdentificationExpanded}
          className={`overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-in-out ${
            optionalIdentificationExpanded
              ? "max-h-[240px] p-1 opacity-100"
              : "max-h-0 p-0 opacity-0"
          }`}
        >
          <FormGrid>
            {IDENTITY_FIELDS.optional.map((field) =>
              field.name === "displayName" ? (
                <InputWithChanges<ContactFormInput>
                  key={field.name}
                  {...field}
                  error={errors.displayName?.message}
                />
              ) : (
                <InputWithChanges<ContactFormInput>
                  key={field.name}
                  {...field}
                  error={errors[field.name]?.message}
                />
              ),
            )}
          </FormGrid>
        </div>
      </FormSection>

      <MailingAddressSection<ContactFormInput>
        title="Address"
        fields={EMPLOYEE_ADDRESS_FIELDS}
        errors={errors}
        getFieldError={(fieldName: Path<ContactFormInput>) => {
          switch (fieldName) {
            case "street":
              return errors.street?.message;
            case "postalCode":
              return errors.postalCode?.message;
            case "city":
              return errors.city?.message;
            case "province":
              return errors.province?.message;
            default:
              return undefined;
          }
        }}
        isProvinceField={(fieldName: Path<ContactFormInput>) =>
          fieldName === "province"
        }
        isPostalCodeField={(fieldName: Path<ContactFormInput>) =>
          fieldName === "postalCode"
        }
        onPostalCodeChange={handlePostalCodeChange}
        onPostalCodeBlur={handlePostalCodeBlur}
        postalProgress={postalProgress}
        postalLookup={{
          postalCodeField: "postalCode",
          cityField: "city",
          provinceField: "province",
          getValue: (fieldName) => getValues(fieldName),
          setValue: (fieldName, value) => {
            setValue(fieldName, value, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
          },
        }}
      />

      <FormSection title="Employment">
        <FormGrid>
          <div className="space-y-2">
            <SelectWithChanges<ContactFormInput>
              label={
                <Clarification
                  term={employeeFieldContent.status.term}
                  description={employeeFieldContent.status.description}
                />
              }
              name="status"
              error={errors.status?.message}
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
                { label: "Terminated", value: "TERMINATED" },
              ]}
            />
            {statusGuidance && (
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {statusGuidance}
              </div>
            )}
          </div>
          <InputWithChanges<ContactFormInput>
            label={
              <Clarification
                term={employeeFieldContent.email.term}
                description={employeeFieldContent.email.description}
              />
            }
            name="email"
            type="email"
            rules={{ required: "Email is required" }}
            error={errors.email?.message}
          />
          {showTerminationDetails && (
            <div className="col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">
                Termination details
              </div>
              <FormGrid>
                <CustomDatePickerWithChanges<ContactFormInput>
                  label={
                    <>
                      <Clarification
                        term={employeeFieldContent.employmentEndDate.term}
                        description={
                          employeeFieldContent.employmentEndDate.description
                        }
                      />{" "}
                      *
                    </>
                  }
                  name="employmentEndDate"
                  maxDate={maxDob}
                  yearJumps={[6, 4, 2]}
                  defaultYearOffset={0}
                  reversePositiveYearJumps={true}
                  error={errors.employmentEndDate?.message}
                />
                <SelectWithChanges<ContactFormInput>
                  label="Termination reason (ROE) *"
                  name="terminationReason"
                  error={errors.terminationReason?.message}
                  options={[
                    { label: "Not set", value: "" },
                    {
                      label: "A - Shortage of work (layoff)",
                      value: "ROE_A_SHORTAGE_OF_WORK",
                    },
                    {
                      label: "B - Strike or lockout",
                      value: "ROE_B_STRIKE_OR_LOCKOUT",
                    },
                    {
                      label: "C - Return to school",
                      value: "ROE_C_RETURN_TO_SCHOOL",
                    },
                    {
                      label: "D - Illness or injury",
                      value: "ROE_D_ILLNESS_OR_INJURY",
                    },
                    { label: "E - Quit", value: "ROE_E_QUIT" },
                    { label: "F - Maternity", value: "ROE_F_MATERNITY" },
                    { label: "G - Retirement", value: "ROE_G_RETIREMENT" },
                    { label: "H - Work sharing", value: "ROE_H_WORK_SHARING" },
                    {
                      label: "J - Apprentice training",
                      value: "ROE_J_APPRENTICE_TRAINING",
                    },
                    { label: "K - Other", value: "ROE_K_OTHER" },
                    { label: "M - Dismissal", value: "ROE_M_DISMISSAL" },
                    {
                      label: "N - Leave of absence",
                      value: "ROE_N_LEAVE_OF_ABSENCE",
                    },
                    { label: "P - Parental", value: "ROE_P_PARENTAL" },
                    {
                      label: "Z - Compassionate care / family caregiver",
                      value: "ROE_Z_COMPASSIONATE_CARE_OR_FAMILY_CAREGIVER",
                    },
                  ]}
                />
              </FormGrid>
            </div>
          )}
          <CustomDatePickerWithChanges<ContactFormInput>
            label={
              <Clarification
                term={employeeFieldContent.hireDate.term}
                description={employeeFieldContent.hireDate.description}
              />
            }
            name="hireDate"
            maxDate={maxDob}
            yearJumps={[6, 4, 2]}
            defaultYearOffset={0}
            reversePositiveYearJumps={true}
            error={errors.hireDate?.message}
          />
          {isFutureHireDate && (
            <div className="col-span-2 rounded border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
              Future start date detected. Use Inactive until the employee begins
              work.
            </div>
          )}
          <SelectWithChanges<ContactFormInput>
            label={
              <Clarification
                term={employeeFieldContent.provinceOfEmployment.term}
                description={
                  employeeFieldContent.provinceOfEmployment.description
                }
              />
            }
            name="employmentProvinceCode"
            options={[...CANADA_PROVINCE_TERRITORY_OPTIONS]}
            error={errors.employmentProvinceCode?.message}
          />
        </FormGrid>

        <SectionDisclosure
          label="Optional"
          expanded={optionalEmploymentExpanded}
          onToggle={() => setShowOptionalEmployment((v) => !v)}
        />

        <div
          inert={!optionalEmploymentExpanded}
          aria-hidden={!optionalEmploymentExpanded}
          className={`overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-in-out ${
            optionalEmploymentExpanded
              ? "max-h-[700px] p-1 opacity-100"
              : "max-h-0 p-0 opacity-0"
          }`}
        >
          <FormGrid>
            <InputWithChanges<ContactFormInput>
              label="Employee number"
              name="employeeNumber"
              rules={{}}
              error={errors.employeeNumber?.message}
            />
            <InputWithChanges<ContactFormInput>
              label="Job title"
              name="employmentTitle"
              rules={{}}
              error={errors.employmentTitle?.message}
            />
            <InputWithChanges<ContactFormInput>
              label="Department"
              name="employmentDepartment"
              rules={{}}
              error={errors.employmentDepartment?.message}
            />
            <CustomDatePickerWithChanges<ContactFormInput>
              label={
                <Clarification
                  term={employeeFieldContent.jobStartDate.term}
                  description={employeeFieldContent.jobStartDate.description}
                />
              }
              name="jobStartDate"
              maxDate={maxDob}
              yearJumps={[6, 4, 2]}
              defaultYearOffset={0}
              reversePositiveYearJumps={true}
              error={errors.jobStartDate?.message}
            />
            <CustomDatePickerWithChanges<ContactFormInput>
              label={
                <Clarification
                  term={employeeFieldContent.jobEndDate.term}
                  description={employeeFieldContent.jobEndDate.description}
                />
              }
              name="jobEndDate"
              maxDate={maxDob}
              yearJumps={[6, 4, 2]}
              defaultYearOffset={0}
              reversePositiveYearJumps={true}
              error={errors.jobEndDate?.message}
            />
          </FormGrid>
        </div>
      </FormSection>

      <FormSection
        title={
          <Clarification
            term="Earnings"
            description={Earnings_SECTION_CLARIFICATION}
          />
        }
      >
        <div className="grid grid-cols-[16rem_1fr] items-end gap-4 px-1">
          <div>
            <SelectWithChanges<ContactFormInput>
              label={
                <Clarification
                  term={employeeFieldContent.payrollUnit.term}
                  description={employeeFieldContent.payrollUnit.description}
                />
              }
              name="payrollUnitId"
              error={errors.payrollUnitId?.message}
              options={[
                { label: "Not set", value: "" },
                ...payrollUnitOptions.map((option) => ({
                  label: option.name,
                  value: option.id,
                })),
              ]}
            />
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">
            <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
              <div className="leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Payday
                </p>
                <p className="text-xs">
                  {selectedPayrollUnitOption?.paydaySummary || "Not set"}
                </p>
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Period end
                </p>
                <p className="text-xs">
                  {selectedPayrollUnitOption?.periodEndSummary || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 overflow-visible rounded-xl border border-slate-200 bg-white">
          <div className="relative z-10 grid w-full grid-cols-[1fr_8rem_8rem] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <div className="pl-2 text-left normal-case">Earning code</div>
            <div className="flex justify-center normal-case">
              <Clarification
                term={employeeFieldContent.jobPayRate.term}
                description={employeeFieldContent.jobPayRate.description}
              />
            </div>
            <div className="flex justify-center normal-case">
              <Clarification
                term="Hours per week"
                description={employeeFieldContent.jobHoursPerWeek.description}
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="grid w-full grid-cols-[1fr_8rem_8rem] items-start gap-2 px-3 py-2">
              <div>
                <select
                  {...register("jobEarningCodeId")}
                  className={cn(
                    "w-full rounded-md border px-3 py-2 text-sm",
                    errors.jobEarningCodeId?.message
                      ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                      : "border-slate-300",
                  )}
                >
                  <option value="">Not set</option>
                  {earningCodeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {`${option.code} - ${option.description}`}
                    </option>
                  ))}
                </select>
                {errors.jobEarningCodeId?.message && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.jobEarningCodeId?.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  {...register("jobPayRate")}
                  placeholder="25.00"
                  className={cn(
                    "w-full rounded-md border px-3 py-2 text-center text-sm placeholder:text-slate-400",
                    errors.jobPayRate?.message
                      ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                      : "border-slate-300",
                  )}
                />
                {errors.jobPayRate?.message && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.jobPayRate?.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  {...register("jobHoursPerWeek")}
                  placeholder="37.50"
                  className={cn(
                    "w-full rounded-md border px-3 py-2 text-center text-sm placeholder:text-slate-400",
                    errors.jobHoursPerWeek?.message
                      ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                      : "border-slate-300",
                  )}
                />
                {errors.jobHoursPerWeek?.message && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.jobHoursPerWeek?.message}
                  </p>
                )}
              </div>
            </div>

            {additionalEarnings.map((_, index) => (
              <div
                key={`additional-earning-${index}`}
                className="grid w-full grid-cols-[1fr_8rem_8rem] items-start gap-2 px-3 py-2"
              >
                <div>
                  <select
                    {...register(
                      `additionalEarnings.${index}.jobEarningCodeId` as const,
                    )}
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-sm",
                      errors.additionalEarnings?.[index]?.jobEarningCodeId
                        ?.message
                        ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                        : "border-slate-300",
                    )}
                  >
                    <option value="">Not set</option>
                    {earningCodeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {`${option.code} - ${option.description}`}
                      </option>
                    ))}
                  </select>
                  {errors.additionalEarnings?.[index]?.jobEarningCodeId
                    ?.message && (
                    <p className="mt-1 text-xs text-red-600">
                      {
                        errors.additionalEarnings?.[index]?.jobEarningCodeId
                          ?.message
                      }
                    </p>
                  )}
                </div>

                <div>
                  <input
                    {...register(
                      `additionalEarnings.${index}.jobPayRate` as const,
                    )}
                    placeholder="25.00"
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-center text-sm placeholder:text-slate-400",
                      errors.additionalEarnings?.[index]?.jobPayRate?.message
                        ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                        : "border-slate-300",
                    )}
                  />
                  {errors.additionalEarnings?.[index]?.jobPayRate?.message && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.additionalEarnings?.[index]?.jobPayRate?.message}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    {...register(
                      `additionalEarnings.${index}.jobHoursPerWeek` as const,
                    )}
                    placeholder="37.50"
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-center text-sm placeholder:text-slate-400",
                      errors.additionalEarnings?.[index]?.jobHoursPerWeek
                        ?.message
                        ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                        : "border-slate-300",
                    )}
                  />
                  {errors.additionalEarnings?.[index]?.jobHoursPerWeek
                    ?.message && (
                    <p className="mt-1 text-xs text-red-600">
                      {
                        errors.additionalEarnings?.[index]?.jobHoursPerWeek
                          ?.message
                      }
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 px-3 py-2">
            <button
              type="button"
              onClick={addAdditionalEarningRow}
              className="inline-flex items-center rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              + Assign earning code
            </button>
          </div>
        </div>
      </FormSection>

      <FormSection
        title={
          <Clarification
            term="Contributory"
            description={CONTRIBUTORY_SECTION_CLARIFICATION}
          />
        }
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid w-full grid-cols-[minmax(0,1fr)_10rem_10rem] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <div className="pl-2 text-left normal-case">
              <Clarification
                term="Contributory code"
                description={CONTRIBUTORY_CODE_COLUMN_CLARIFICATION}
              />
            </div>
            <div className="text-center normal-case whitespace-nowrap">
              <Clarification
                term="Deduction per pay"
                description={CONTRIBUTORY_DEDUCTION_COLUMN_CLARIFICATION}
              />
            </div>
            <div className="text-center normal-case whitespace-nowrap">
              <Clarification
                term="Employer participation"
                description={CONTRIBUTORY_PARTICIPATION_COLUMN_CLARIFICATION}
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {contributorySelections.length === 0 ? (
              <div className="px-3 py-3 text-sm text-slate-500">
                No contributory code selected.
              </div>
            ) : (
              contributorySelections.map((selection, index) => {
                const selectedOption = contributoryCodeOptions.find(
                  (option) => option.id === selection.contributoryCodeId,
                );

                return (
                  <div
                    key={`${selection.contributoryCodeId || "new"}-${index}`}
                    className="grid w-full grid-cols-[minmax(0,1fr)_10rem_10rem] items-start gap-2 px-3 py-2"
                  >
                    <div>
                      <select
                        {...register(
                          `contributorySelections.${index}.contributoryCodeId` as const,
                        )}
                        onChange={(event) => {
                          const selectedId = event.target.value;
                          const matchedOption = contributoryCodeOptions.find(
                            (option) => option.id === selectedId,
                          );

                          setValue(
                            `contributorySelections.${index}.contributoryCodeId` as const,
                            selectedId,
                            { shouldDirty: true, shouldValidate: true },
                          );

                          if (!matchedOption) return;

                          const currentDeduction =
                            getValues(
                              `contributorySelections.${index}.deductionAmount` as const,
                            ) || "";
                          const currentParticipation =
                            getValues(
                              `contributorySelections.${index}.participationAmount` as const,
                            ) || "";

                          if (!currentDeduction.trim()) {
                            setValue(
                              `contributorySelections.${index}.deductionAmount` as const,
                              formatPerPayAmount(
                                matchedOption.defaultDeductionAmount,
                                payPeriodsPerYear,
                              ),
                              { shouldDirty: true, shouldValidate: true },
                            );
                          }

                          if (!currentParticipation.trim()) {
                            setValue(
                              `contributorySelections.${index}.participationAmount` as const,
                              formatPerPayAmount(
                                matchedOption.defaultParticipationAmount,
                                payPeriodsPerYear,
                              ),
                              { shouldDirty: true, shouldValidate: true },
                            );
                          }
                        }}
                        className={cn(
                          "w-full rounded-md border px-3 py-2 text-sm",
                          errors.contributorySelections?.[index]
                            ?.contributoryCodeId?.message
                            ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                            : "border-slate-300",
                        )}
                      >
                        <option value="">Select code</option>
                        {contributoryCodeOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.code} - {option.description}
                          </option>
                        ))}
                      </select>
                      {errors.contributorySelections?.[index]
                        ?.contributoryCodeId?.message && (
                        <p className="mt-1 text-xs text-red-600">
                          {
                            errors.contributorySelections?.[index]
                              ?.contributoryCodeId?.message
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        {...register(
                          `contributorySelections.${index}.deductionAmount` as const,
                        )}
                        placeholder="0.00"
                        onChange={(event) => {
                          event.target.value = formatAccountingInput(
                            event.target.value,
                          );
                        }}
                        onBlur={(event) => {
                          event.target.value = formatAccountingOnBlur(
                            event.target.value,
                          );
                        }}
                        className={cn(
                          "w-full rounded-md border px-3 py-2 text-center text-sm",
                          errors.contributorySelections?.[index]
                            ?.deductionAmount?.message
                            ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                            : "border-slate-300",
                        )}
                      />
                    </div>

                    <div>
                      <input
                        {...register(
                          `contributorySelections.${index}.participationAmount` as const,
                        )}
                        placeholder="0.00"
                        onChange={(event) => {
                          event.target.value = formatAccountingInput(
                            event.target.value,
                          );
                        }}
                        onBlur={(event) => {
                          event.target.value = formatAccountingOnBlur(
                            event.target.value,
                          );
                        }}
                        className={cn(
                          "w-full rounded-md border px-3 py-2 text-center text-sm",
                          errors.contributorySelections?.[index]
                            ?.participationAmount?.message
                            ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                            : "border-slate-300",
                        )}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="border-t border-slate-100 px-3 py-2">
            <button
              type="button"
              onClick={addContributorySelectionRow}
              className="inline-flex items-center rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              + Assign contributory code
            </button>
          </div>
        </div>
      </FormSection>

      <FormSection title="Withholdings">
        <FormGrid>
          <InputWithChanges<ContactFormInput>
            label="Federal claim"
            name="federalClaim"
            placeholder="e.g. 0.00"
            rules={{}}
            error={errors.federalClaim?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="Provincial claim"
            name="provincialClaim"
            placeholder="e.g. 0.00"
            rules={{}}
            error={errors.provincialClaim?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="Additional tax"
            name="additionalTax"
            placeholder="e.g. 0.00"
            rules={{}}
            error={errors.additionalTax?.message}
          />
          <div
            className={cn(inputWithChangesStyles.wrapper, "relative -top-0.5")}
          >
            <div className={inputWithChangesStyles.headerRow}>
              <CapLabel>Exemption</CapLabel>
            </div>
            <div className={inputWithChangesStyles.inputWrapper}>
              <div className="flex min-h-10 flex-wrap items-center gap-4 rounded-lg border border-slate-200 px-5 py-2">
                {WITHHOLDING_EXEMPTION_OPTIONS.map((option) => {
                  const checked = selectedExemptions.has(option.value);

                  return (
                    <label
                      key={option.value}
                      className="inline-flex items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const nextSelections = new Set(selectedExemptions);

                          if (e.target.checked) {
                            nextSelections.add(option.value);
                          } else {
                            nextSelections.delete(option.value);
                          }

                          const serializedValue =
                            WITHHOLDING_EXEMPTION_OPTIONS.map(
                              (entry) => entry.value,
                            )
                              .filter((value) => nextSelections.has(value))
                              .map((value) => value.toUpperCase())
                              .join(", ");

                          setValue("exemptions", serializedValue, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-400"
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            {errors.exemptions?.message && (
              <p className="text-xs text-red-600">
                {errors.exemptions.message}
              </p>
            )}
          </div>
        </FormGrid>
      </FormSection>

      <FormSection
        title={
          <Clarification
            term={employeeFieldContent.deposit.term}
            description={employeeFieldContent.deposit.description}
          />
        }
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid w-full grid-cols-[2rem_6rem_12rem_8rem_6rem_6rem] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <div className="text-center normal-case">Seq.</div>
            <div className="text-center normal-case">Bank#</div>
            <div className="text-center normal-case">Transit#-Account#</div>
            <div className="text-center normal-case">Split by</div>
            <div className="text-center normal-case">Amount / %</div>
            <div className="pl-1 text-left normal-case">Status</div>
          </div>
          <div className="divide-y divide-slate-100">
            {bankAccounts.map(
              (_: ContactFormInput["bankAccounts"][number], index: number) => (
                <BankAccountRow
                  key={index}
                  index={index}
                  register={register}
                  setValue={setValue}
                  getValues={getValues}
                  errors={errors}
                  verificationStatus={
                    bankAccountStatuses[index] ?? "UNVERIFIED"
                  }
                />
              ),
            )}
          </div>
          <div className="border-t border-slate-100 px-3 py-2">
            <button
              type="button"
              onClick={addBankAccountRow}
              disabled={bankAccounts.length >= MAX_BANK_ACCOUNTS}
              className="inline-flex items-center rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add account
            </button>
          </div>
        </div>
      </FormSection>

      <FormSection title="Time-Off">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid w-full grid-cols-[minmax(0,1fr)_9rem_7rem_10rem_6rem] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <div className="text-left normal-case">Policy</div>
            <div className="text-center normal-case">Accrual frequency</div>
            <div className="flex justify-center text-center normal-case">
              <Clarification
                term="Accrual rate %"
                description={ACCRUAL_RATE_CLARIFICATION}
              />
            </div>
            <div className="text-center normal-case">
              Annual allowance (hrs)
            </div>
            <div className="flex justify-center text-center normal-case">
              <Clarification
                term="Hour cap"
                description={HOUR_CAP_CLARIFICATION}
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {TIME_OFF_ROWS.map((row) => {
              const fieldError = errors[row.accrualRateName]?.message;
              const accrualRateValue =
                timeOffAccrualRateValues[row.accrualRateName].trim();
              const accrualFrequencyValue =
                timeOffAccrualFrequency[row.accrualRateName];
              const annualAllowanceRaw =
                timeOffHoursPerYear[row.accrualRateName] || "";
              const hourCapRaw =
                timeOffCappedAtHours[row.accrualRateName] || "";

              const annualAllowanceValue =
                parseOptionalTimeOffNumber(annualAllowanceRaw);
              const hourCapValue = parseOptionalTimeOffNumber(hourCapRaw);
              const hasNonZeroAnnualAllowance =
                annualAllowanceValue !== null && annualAllowanceValue !== 0;

              const isVacation = row.accrualRateName === "vacationTimeOff";
              const isPerHourWorked =
                accrualFrequencyValue === "Per hour worked";

              const localAccrualRateError =
                shouldRunTimeOffValidation &&
                isVacation &&
                isPerHourWorked &&
                !accrualRateValue
                  ? "Accrual rate is required when frequency is Per hour worked."
                  : undefined;

              const annualAllowanceError =
                shouldRunTimeOffValidation &&
                annualAllowanceRaw.trim() &&
                annualAllowanceValue === null
                  ? "Annual allowance must be a valid number."
                  : shouldRunTimeOffValidation &&
                      isVacation &&
                      isPerHourWorked &&
                      annualAllowanceValue !== null &&
                      annualAllowanceValue !== 0
                    ? "For Vacation with Per hour worked, Annual allowance must be blank or 0."
                    : undefined;

              const hourCapError =
                shouldRunTimeOffValidation &&
                hourCapRaw.trim() &&
                hourCapValue === null
                  ? "Hour cap must be a valid number."
                  : shouldRunTimeOffValidation &&
                      hasNonZeroAnnualAllowance &&
                      !hourCapRaw.trim()
                    ? "Hour cap is required when Annual allowance is non-zero."
                    : shouldRunTimeOffValidation &&
                        hasNonZeroAnnualAllowance &&
                        hourCapValue !== null &&
                        hourCapValue < annualAllowanceValue
                      ? "Hour cap must be no less than Annual allowance."
                      : shouldRunTimeOffValidation &&
                          isVacation &&
                          isPerHourWorked &&
                          hourCapValue !== null &&
                          hourCapValue !== 0
                        ? "For Vacation with Per hour worked, Hour cap must be blank or 0."
                        : undefined;

              return (
                <div
                  key={row.accrualRateName}
                  className="grid w-full grid-cols-[minmax(0,1fr)_9rem_7rem_10rem_6rem] items-start gap-2 px-3 py-2"
                >
                  <div className="flex h-10 items-center text-sm text-slate-700">
                    {row.accrualRateName === "vacationTimeOff" ? (
                      <Clarification
                        term={row.policy}
                        description={VACATION_POLICY_CLARIFICATION}
                      />
                    ) : (
                      row.policy
                    )}
                  </div>
                  <div>
                    <select
                      value={timeOffAccrualFrequency[row.accrualRateName]}
                      onChange={(event) => {
                        setTimeOffAccrualFrequency((current) => ({
                          ...current,
                          [row.accrualRateName]: event.target.value,
                        }));
                      }}
                      aria-label={`${row.policy} accrual frequency`}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value=""></option>
                      {ACCRUAL_FREQUENCY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      {...register(row.accrualRateName, {
                        validate: {
                          annualAllowanceHourCapRule: () => {
                            if (!shouldRunTimeOffValidation) {
                              return true;
                            }

                            if (hasNonZeroAnnualAllowance) {
                              if (hourCapValue === null) {
                                return "Hour cap is required when Annual allowance is non-zero.";
                              }

                              if (hourCapValue < annualAllowanceValue) {
                                return "Hour cap must be no less than Annual allowance.";
                              }
                            }

                            return true;
                          },
                        },
                      })}
                      placeholder="0.00"
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-center text-sm placeholder:text-slate-400",
                        fieldError || localAccrualRateError
                          ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                          : "border-slate-300",
                      )}
                    />
                    {fieldError && (
                      <p className="mt-1 text-xs text-red-600">{fieldError}</p>
                    )}
                    {!fieldError && localAccrualRateError && (
                      <p className="mt-1 text-xs text-red-600">
                        {localAccrualRateError}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      value={timeOffHoursPerYear[row.accrualRateName]}
                      onChange={(event) => {
                        setTimeOffHoursPerYear((current) => ({
                          ...current,
                          [row.accrualRateName]: event.target.value,
                        }));
                      }}
                      placeholder="0.00"
                      aria-label={`${row.policy} hours per year`}
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-center text-sm placeholder:text-slate-400",
                        annualAllowanceError
                          ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                          : "border-slate-300",
                      )}
                    />
                    {annualAllowanceError && (
                      <p className="mt-1 text-xs text-red-600">
                        {annualAllowanceError}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      value={timeOffCappedAtHours[row.accrualRateName]}
                      onChange={(event) => {
                        setTimeOffCappedAtHours((current) => ({
                          ...current,
                          [row.accrualRateName]: event.target.value,
                        }));
                      }}
                      placeholder="0.00"
                      aria-label={`${row.policy} capped at hours`}
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-center text-sm placeholder:text-slate-400",
                        hourCapError
                          ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
                          : "border-slate-300",
                      )}
                    />
                    {hourCapError && (
                      <p className="mt-1 text-xs text-red-600">
                        {hourCapError}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </FormSection>

      <FormSection title="Emergency">
        <FormGrid>
          <InputWithChanges<ContactFormInput>
            label="Given name"
            name="emergencyContactGivenName"
            rules={{}}
            error={errors.emergencyContactGivenName?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="Family name"
            name="emergencyContactFamilyName"
            rules={{}}
            error={errors.emergencyContactFamilyName?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="Relationship"
            name="emergencyContactName"
            rules={{}}
            error={errors.emergencyContactName?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="Phone"
            name="emergencyContactPhone"
            type="tel"
            rules={{}}
            error={errors.emergencyContactPhone?.message}
          />
        </FormGrid>
      </FormSection>
    </>
  );
}
