"use client";
// components/employee/employee-form.tsx

import { useState } from "react";
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
import {
  getPostalCodeProgress,
  type PostalCodeProgressTone,
} from "@/utils/validators/postalCodeProgress";
import {
  getInstitutionBadgeClass,
  getInstitutionShortName,
} from "@/constants/financial-institutions";

interface EmployeeFormProps {
  errors: FieldErrors<ContactFormInput>;
  bankAccountStatuses?: readonly string[];
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
}: EmployeeFormProps) {
  const { register, setValue, getValues } = useFormContext<ContactFormInput>();
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
  const bankAccounts = (useWatch({ name: "bankAccounts" as const }) ||
    []) as ContactFormInput["bankAccounts"];
  const statusValue = useWatch({ name: "status" as const });
  const [
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
    jobHoursPerWeekValue,
  ] = useWatch({
    name: [
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
      "jobHoursPerWeek",
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
  const optionalEmploymentExpanded =
    showOptionalEmployment ||
    Boolean(
      errors.employeeNumber?.message ||
      errors.employmentTitle?.message ||
      errors.employmentDepartment?.message ||
      errors.jobStartDate?.message ||
      errors.jobEndDate?.message ||
      errors.jobHoursPerWeek?.message ||
      String(employeeNumberValue || "").trim() ||
      String(employmentTitleValue || "").trim() ||
      String(employmentDepartmentValue || "").trim() ||
      String(jobStartDateValue || "").trim() ||
      String(jobEndDateValue || "").trim() ||
      String(jobHoursPerWeekValue || "").trim(),
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
          <SelectWithChanges<ContactFormInput>
            label="Pay type"
            name="jobPayType"
            error={errors.jobPayType?.message}
            options={[
              { label: "Not set", value: "" },
              { label: "Hourly", value: "HOURLY" },
              { label: "Salary", value: "SALARY" },
            ]}
          />
          <InputWithChanges<ContactFormInput>
            label={
              <Clarification
                term={employeeFieldContent.jobPayRate.term}
                description={employeeFieldContent.jobPayRate.description}
              />
            }
            name="jobPayRate"
            placeholder="25.00"
            rules={{}}
            error={errors.jobPayRate?.message}
          />
          <InputWithChanges<ContactFormInput>
            label={
              <Clarification
                term={employeeFieldContent.jobHoursPerWeek.term}
                description={employeeFieldContent.jobHoursPerWeek.description}
              />
            }
            name="jobHoursPerWeek"
            placeholder="37.50"
            rules={{}}
            error={errors.jobHoursPerWeek?.message}
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

      <FormSection title="Bank accounts for direct deposit">
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

      <FormSection title="Contact">
        <FormGrid>
          <InputWithChanges<ContactFormInput>
            label="Phone"
            name="phone"
            type="tel"
            rules={{}}
            error={errors.phone?.message}
          />
        </FormGrid>
      </FormSection>
    </>
  );
}
