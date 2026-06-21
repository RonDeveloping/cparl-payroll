"use client";
// components/employee/employee-form.tsx

import {
  FieldErrors,
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
import { FormGrid } from "@/components/form/form-grid";
import { Clarification } from "@/components/clarification";
import formatSIN from "@/utils/formatters/sin";
import { cn } from "@/lib/utils";
import { CANADA_PROVINCE_TERRITORY_OPTIONS } from "@/constants/canada-provinces";
import {
  getInstitutionBadgeClass,
  getInstitutionShortName,
} from "@/constants/financial-institutions";

interface EmployeeFormProps {
  errors: FieldErrors<ContactFormInput>;
  bankAccountStatuses?: readonly string[];
}

const MAX_BANK_ACCOUNTS = 10;

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
  const bankAccounts = (useWatch({ name: "bankAccounts" as const }) ||
    []) as ContactFormInput["bankAccounts"];

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
                term="SIN"
                description="Social Insurance Number (9 digits, formatted as XXX-XXX-XXX)."
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
              <Clarification term="Date of birth" description="YYYY-MM-DD" />
            }
            name="dob"
            minDate={minDob}
            maxDate={maxDob}
            error={errors.dob?.message}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Employment">
        <FormGrid>
          <InputWithChanges<ContactFormInput>
            label="Employee number"
            name="employeeNumber"
            rules={{}}
            error={errors.employeeNumber?.message}
          />
          <SelectWithChanges<ContactFormInput>
            label="Employment status"
            name="status"
            error={errors.status?.message}
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "On leave", value: "ON_LEAVE" },
              { label: "Terminated", value: "TERMINATED" },
            ]}
          />
          <CustomDatePickerWithChanges<ContactFormInput>
            label={<Clarification term="Hire date" description="YYYY-MM-DD" />}
            name="hireDate"
            maxDate={maxDob}
            yearJumps={[6, 4, 2]}
            defaultYearOffset={0}
            reversePositiveYearJumps={true}
            error={errors.hireDate?.message}
          />
          <CustomDatePickerWithChanges<ContactFormInput>
            label={
              <Clarification
                term="Employment end date"
                description="YYYY-MM-DD"
              />
            }
            name="employmentEndDate"
            maxDate={maxDob}
            yearJumps={[6, 4, 2]}
            defaultYearOffset={0}
            reversePositiveYearJumps={true}
            error={errors.employmentEndDate?.message}
          />
          <SelectWithChanges<ContactFormInput>
            label="Termination reason (ROE)"
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
          <SelectWithChanges<ContactFormInput>
            label={
              <Clarification
                term="Employment province code"
                description="use the province of the employer establishment where the employee reports for work, or where they are paid from."
              />
            }
            name="employmentProvinceCode"
            options={[...CANADA_PROVINCE_TERRITORY_OPTIONS]}
            error={errors.employmentProvinceCode?.message}
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
              <Clarification term="Job start date" description="YYYY-MM-DD" />
            }
            name="jobStartDate"
            maxDate={maxDob}
            yearJumps={[6, 4, 2]}
            defaultYearOffset={0}
            reversePositiveYearJumps={true}
            error={errors.jobStartDate?.message}
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
            label="Pay rate"
            name="jobPayRate"
            placeholder="25.00"
            rules={{}}
            error={errors.jobPayRate?.message}
          />
          <CustomDatePickerWithChanges<ContactFormInput>
            label={
              <Clarification
                term="Job end date"
                description="YYYY-MM-DD (leave empty if ongoing)"
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
      </FormSection>

      <FormSection title="Bank Accounts For Direct Deposit">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid w-full grid-cols-[2rem_6rem_12rem_8rem_6rem_6rem] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <div className="text-center">Seq.</div>
            <div className="text-center">Bank#</div>
            <div className="text-center">Transit#-Account#</div>
            <div className="text-center">Split By</div>
            <div className="text-center">Amount / %</div>
            <div className="pl-1 text-left">Status</div>
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
            label="Email"
            name="email"
            type="email"
            rules={{ required: "Email is required" }}
            error={errors.email?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="Phone"
            name="phone"
            type="tel"
            rules={{}}
            error={errors.phone?.message}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Address">
        <FormGrid>
          <InputWithChanges<ContactFormInput>
            label="Street"
            name="street"
            rules={{}}
            error={errors.street?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="City"
            name="city"
            rules={{}}
            error={errors.city?.message}
          />
          <SelectWithChanges<ContactFormInput>
            label="Province"
            name="province"
            options={[...CANADA_PROVINCE_TERRITORY_OPTIONS]}
            error={errors.province?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="Postal code"
            name="postalCode"
            rules={{}}
            error={errors.postalCode?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="Country"
            name="country"
            rules={{}}
            error={errors.country?.message}
          />
        </FormGrid>
      </FormSection>
    </>
  );
}
