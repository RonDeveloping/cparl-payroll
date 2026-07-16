"use client";
// components/tenant/tenant-form.tsx

import { useEffect, useState } from "react";
import { FieldErrors } from "react-hook-form";
import { Path } from "react-hook-form";
import { TenantFormInput } from "@/lib/validations/tenant-schema";
import FormSection from "@/components/form/form-section";
import InputWithChanges from "@/components/form/input-with-changes";
import SectionDisclosure from "@/components/section-disclosure";
import { FormGrid } from "@/components/form/form-grid";
import {
  MailingAddressSection,
  type MailingAddressField,
} from "../shared/mailing-address-section";
import formatBusinessNumber from "@/utils/formatters/businessNumber";
import formatPostalCode from "@/utils/formatters/postalCode";
import { Clarification } from "@/components/clarification";
import {
  getPostalCodeProgress,
  type PostalCodeProgressTone,
} from "@/utils/validators/postalCodeProgress";
import SelectWithChanges from "@/components/form/select-with-changes";
import DayOfMonthPickerWithChanges from "@/components/form/day-of-month-picker-with-changes";
import DayOfWeekPickerWithChanges from "../form/day-of-week-picker-with-changes";
import { tenantFieldContent } from "@/constants/content";

interface TenantFormProps {
  errors: FieldErrors<TenantFormInput>;
  payFrequency?: TenantFormInput["payFrequency"];
  getFieldValue: (fieldName: Path<TenantFormInput>) => unknown;
  setFieldValue: (fieldName: Path<TenantFormInput>, value: string) => void;
}

const TENANT_ADDRESS_FIELDS: MailingAddressField<TenantFormInput>[] = [
  {
    label: "Street",
    name: "address.street",
    rules: {},
  },
  {
    label: "Postal code",
    name: "address.postalCode",
    rules: {},
    formatOnChange: formatPostalCode,
  },
  {
    label: "City",
    name: "address.city",
    rules: {},
  },
  {
    label: "Province",
    name: "address.province",
    rules: {},
  },
];

export function TenantForm({
  errors,
  payFrequency,
  getFieldValue,
  setFieldValue,
}: TenantFormProps) {
  const [postalProgress, setPostalProgress] = useState<{
    text: string;
    tone: PostalCodeProgressTone;
  }>({
    text: "",
    tone: "neutral",
  });
  const [showOptionalIdentification, setShowOptionalIdentification] =
    useState(false);
  const [showOptionalGLMatrix, setShowOptionalGLMatrix] = useState(false);
  const optionalIdentificationExpanded =
    showOptionalIdentification || Boolean(errors.operatingName?.message);
  const selectedPayFrequency = payFrequency ?? null;
  const hasSelectedPayFrequency = Boolean(selectedPayFrequency);
  const isSemiMonthly = selectedPayFrequency === "SEMIMONTHLY";
  const isMonthly = selectedPayFrequency === "MONTHLY";
  const isBiweekly = selectedPayFrequency === "BIWEEKLY";
  const isWeekly = selectedPayFrequency === "WEEKLY";
  const showAnchoredDay = false;
  const showPayPeriodEndPicker = isMonthly;
  const unitNamePlaceholder =
    selectedPayFrequency === "MONTHLY"
      ? "e.g. Main Monthly or Monthly_HQ"
      : selectedPayFrequency === "SEMIMONTHLY"
        ? "e.g. Main Semi-Monthly or SemiMonthly_HQ"
        : selectedPayFrequency === "BIWEEKLY"
          ? "e.g. Main Biweekly or Biweekly_HQ"
          : selectedPayFrequency === "WEEKLY"
            ? "e.g. Main Weekly or Weekly_HQ"
            : "e.g. Main Payroll or Payroll_HQ";

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostalProgress(getPostalCodeProgress(e.target.value || ""));
  };

  const handlePostalCodeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setPostalProgress(getPostalCodeProgress(e.target.value || ""));
  };

  useEffect(() => {
    if (!(isBiweekly || isWeekly)) return;

    const currentWeekOffset = getFieldValue("boundaryShift");
    if (currentWeekOffset === "" || currentWeekOffset == null) {
      setFieldValue("boundaryShift", "-1");
    }
  }, [getFieldValue, isBiweekly, isWeekly, setFieldValue]);

  return (
    <>
      <FormSection title="Identification">
        <FormGrid>
          <InputWithChanges<TenantFormInput>
            label="Legal name"
            name="coreName"
            placeholder="e.g. 1234567 Canada Inc."
            rules={{ required: "Legal name is required" }}
            error={errors.coreName?.message}
          />
          <InputWithChanges<TenantFormInput>
            label={
              <Clarification
                term="Business number"
                description="A CRA-issued, unique identifier for the employer or branch, enterable later if no remittance or reporting is due"
              />
            }
            name="businessNumber"
            placeholder="###-###-### RP ####"
            rules={{}}
            formatOnChange={formatBusinessNumber}
            maxLength={19}
            error={errors.businessNumber?.message}
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
          className={`transition-[max-height,opacity,padding] duration-300 ease-in-out ${
            optionalIdentificationExpanded
              ? "max-h-[260px] overflow-visible p-1 opacity-100"
              : "max-h-0 overflow-hidden p-0 opacity-0"
          }`}
        >
          <FormGrid>
            <InputWithChanges<TenantFormInput>
              label={
                <Clarification
                  term="Doing business as (DBA)"
                  description={
                    'A DBA, also known as an operating name, "Operating As" (o/a), Trade Name or Business Name. If it differs from the legal name of the business, the DBA will be added on T4 slips to help employees recgonize who issued the slip.'
                  }
                />
              }
              name="operatingName"
              placeholder="e.g. All Stuff Depot"
              rules={{}}
              error={errors.operatingName?.message}
            />
          </FormGrid>
        </div>
      </FormSection>

      <MailingAddressSection<TenantFormInput>
        fields={TENANT_ADDRESS_FIELDS}
        errors={errors}
        getFieldError={(fieldName) => {
          switch (fieldName) {
            case "address.street":
              return errors.address?.street?.message;
            case "address.postalCode":
              return errors.address?.postalCode?.message;
            case "address.city":
              return errors.address?.city?.message;
            case "address.province":
              return errors.address?.province?.message;
            default:
              return undefined;
          }
        }}
        isProvinceField={(fieldName) => fieldName === "address.province"}
        isPostalCodeField={(fieldName) => fieldName === "address.postalCode"}
        onPostalCodeChange={handlePostalCodeChange}
        onPostalCodeBlur={handlePostalCodeBlur}
        postalProgress={postalProgress}
        postalLookup={{
          postalCodeField: "address.postalCode",
          cityField: "address.city",
          provinceField: "address.province",
          getValue: getFieldValue,
          setValue: setFieldValue,
        }}
      />

      <FormSection title="Contact Person">
        <FormGrid>
          <InputWithChanges<TenantFormInput>
            label={
              <Clarification
                term="First name"
                description="The contact person's first name for payroll-related emails, calls, and correspondence."
              />
            }
            name="contactFirstName"
            placeholder="e.g. Jane"
            rules={{}}
            error={errors.contactFirstName?.message}
          />
          <InputWithChanges<TenantFormInput>
            label={
              <Clarification
                term="Last name"
                description="The contact person's last name for payroll-related emails, calls, and correspondence."
              />
            }
            name="contactLastName"
            placeholder="e.g. Doe"
            rules={{}}
            error={errors.contactLastName?.message}
          />
          <InputWithChanges<TenantFormInput>
            label={
              <Clarification
                term="Email"
                description="Used to receive notifications such as acknowledgment, processing, and completion updates."
              />
            }
            name="email"
            type="email"
            rules={{}}
            error={errors.email?.message}
          />
          <InputWithChanges<TenantFormInput>
            label={
              <Clarification
                term="Phone"
                description="Used for unusual events such as insufficient funds, deposit failures, or other urgent issues."
              />
            }
            name="phone"
            type="tel"
            rules={{}}
            error={errors.phone?.message}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Payroll Unit">
        <FormGrid>
          <SelectWithChanges<TenantFormInput>
            label={
              <Clarification
                term={tenantFieldContent.frequency.term}
                description={tenantFieldContent.frequency.description}
              />
            }
            name="payFrequency"
            error={errors.payFrequency?.message}
            options={[
              { label: "Monthly", value: "MONTHLY" },
              { label: "Semi-monthly", value: "SEMIMONTHLY" },
              { label: "Biweekly", value: "BIWEEKLY" },
              { label: "Weekly", value: "WEEKLY" },
            ]}
          />

          {hasSelectedPayFrequency && (
            <>
              <InputWithChanges<TenantFormInput>
                label={
                  <Clarification
                    term="Unit name"
                    description={tenantFieldContent.payrollUnit.description}
                  />
                }
                name="payrollUnitName"
                placeholder={unitNamePlaceholder}
                rules={{}}
                error={errors.payrollUnitName?.message}
              />

              {isMonthly && (
                <DayOfMonthPickerWithChanges<TenantFormInput>
                  label={
                    <Clarification
                      term={tenantFieldContent.payday.term}
                      description={tenantFieldContent.payday.description}
                    />
                  }
                  name="payday"
                  error={errors.payday?.message}
                  placeholder="Choose a day (1-31)"
                  defaultDay={31}
                />
              )}
              {showPayPeriodEndPicker && (
                <DayOfMonthPickerWithChanges<TenantFormInput>
                  label={
                    <Clarification
                      term={tenantFieldContent.periodEndDay.term}
                      description={tenantFieldContent.periodEndDay.description}
                    />
                  }
                  name="periodEndDay"
                  error={errors.periodEndDay?.message}
                  placeholder="Choose a day (1-28, or 3rd-to-last / 2nd-to-last / last day)"
                  defaultDay={null}
                  monthShiftName="boundaryShift"
                />
              )}

              {(isBiweekly || isWeekly) && (
                <>
                  <DayOfWeekPickerWithChanges<TenantFormInput>
                    label={
                      <Clarification
                        term="Payday"
                        description={tenantFieldContent.payday.description}
                      />
                    }
                    name="payWeekday"
                    error={errors.payWeekday?.message}
                    defaultWeekday="MONDAY"
                  />

                  <DayOfWeekPickerWithChanges<TenantFormInput>
                    label={
                      <Clarification
                        term="Pay period end"
                        description={
                          tenantFieldContent.periodEndDay.description
                        }
                      />
                    }
                    name="periodEndWeekday"
                    error={
                      errors.periodEndWeekday?.message ||
                      errors.boundaryShift?.message
                    }
                    defaultWeekday="FRIDAY"
                    relativeWeekName="boundaryShift"
                    defaultRelativeWeekShift={-1}
                  />
                </>
              )}

              {isSemiMonthly && (
                <>
                  <DayOfMonthPickerWithChanges<TenantFormInput>
                    label={
                      <Clarification
                        term="First payday"
                        description={tenantFieldContent.payday.description}
                      />
                    }
                    name="payday"
                    error={errors.payday?.message}
                    placeholder="Choose a day (1-31)"
                    defaultDay={15}
                  />

                  <DayOfMonthPickerWithChanges<TenantFormInput>
                    label={
                      <Clarification
                        term="First pay period end"
                        description={
                          tenantFieldContent.periodEndDay.description
                        }
                      />
                    }
                    name="periodEndDay"
                    error={errors.periodEndDay?.message}
                    placeholder="Choose a day (1-28, or -1 to -3 for month-end days)"
                    defaultDay={14}
                    monthShiftName="boundaryShift"
                  />

                  <DayOfMonthPickerWithChanges<TenantFormInput>
                    label={
                      <Clarification
                        term="Second payday"
                        description={tenantFieldContent.payday2.description}
                      />
                    }
                    name="payday2"
                    error={errors.payday2?.message}
                    placeholder="Choose a day (1-31)"
                    defaultDay={30}
                  />

                  <DayOfMonthPickerWithChanges<TenantFormInput>
                    label={
                      <Clarification
                        term="Second pay period end"
                        description={
                          tenantFieldContent.periodEndDay.description
                        }
                      />
                    }
                    name="periodEndDay2"
                    error={errors.periodEndDay?.message}
                    placeholder="Choose a day (1-31)"
                    defaultDay={29}
                    monthShiftName="boundaryShift2"
                  />
                </>
              )}

              {showAnchoredDay && (
                <InputWithChanges<TenantFormInput>
                  label={
                    <Clarification
                      term={tenantFieldContent.periodEndDay.term}
                      description={tenantFieldContent.periodEndDay.description}
                    />
                  }
                  name="periodEndDay"
                  placeholder="e.g. 1"
                  type="number"
                  rules={{}}
                  error={errors.periodEndDay?.message}
                />
              )}
            </>
          )}
        </FormGrid>

        <SectionDisclosure
          label="GL Matrix (optional)"
          expanded={showOptionalGLMatrix}
          onToggle={() => setShowOptionalGLMatrix((v) => !v)}
        />

        <div
          inert={!showOptionalGLMatrix}
          aria-hidden={!showOptionalGLMatrix}
          className={`overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-in-out ${
            showOptionalGLMatrix
              ? "max-h-[300px] p-1 opacity-100"
              : "max-h-0 p-0 opacity-0"
          }`}
        >
          <FormGrid>
            <InputWithChanges<TenantFormInput>
              label={
                <Clarification
                  term={tenantFieldContent.expenseAccountCode.term}
                  description={
                    tenantFieldContent.expenseAccountCode.description
                  }
                />
              }
              name="glExpenseAccountCode"
              placeholder="e.g. 5100"
              rules={{}}
              error={errors.glExpenseAccountCode?.message}
            />
            <InputWithChanges<TenantFormInput>
              label={
                <Clarification
                  term={tenantFieldContent.liabilityAccountCode.term}
                  description={
                    tenantFieldContent.liabilityAccountCode.description
                  }
                />
              }
              name="glLiabilityAccountCode"
              placeholder="e.g. 2100"
              rules={{}}
              error={errors.glLiabilityAccountCode?.message}
            />
            <InputWithChanges<TenantFormInput>
              label={
                <Clarification
                  term={tenantFieldContent.clearingAccountCode.term}
                  description={
                    tenantFieldContent.clearingAccountCode.description
                  }
                />
              }
              name="glClearingAccountCode"
              placeholder="e.g. 1010"
              rules={{}}
              error={errors.glClearingAccountCode?.message}
            />
          </FormGrid>
        </div>
      </FormSection>
    </>
  );
}
