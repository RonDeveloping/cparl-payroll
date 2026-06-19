"use client";
// components/tenant/tenant-form.tsx

import { useEffect, useState } from "react";
import { FieldErrors } from "react-hook-form";
import { TenantFormInput } from "@/lib/validations/tenant-schema";
import FormSection from "@/components/form/form-section";
import InputWithChanges from "@/components/form/input-with-changes";
import SelectWithChanges from "@/components/form/select-with-changes";
import SectionDisclosure from "@/components/section-disclosure";
import { FormGrid } from "@/components/form/form-grid";
import formatBusinessNumber from "@/utils/formatters/businessNumber";
import formatPostalCode from "@/utils/formatters/postalCode";
import { Clarification } from "@/components/clarification";
import { CANADA_PROVINCE_TERRITORY_OPTIONS } from "@/constants/canada-provinces";
import { tenantFieldContent } from "@/constants/content";
import {
  getPostalCodeProgress,
  type PostalCodeProgressTone,
} from "@/utils/validators/postalCodeProgress";

interface TenantFormProps {
  errors: FieldErrors<TenantFormInput>;
  showMembership?: boolean;
  onPostalCodeChange?: () => void;
  onPostalCodeBlur?: () => void;
}

type TenantAddressField = {
  label: string;
  name:
    | "address.street"
    | "address.postalCode"
    | "address.city"
    | "address.province";
  rules: Record<string, never>;
  formatOnChange?: (value: string) => string;
};

const TENANT_FIELDS: { address: TenantAddressField[] } = {
  address: [
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
  ],
};

export function TenantForm({
  errors,
  showMembership,
  onPostalCodeChange,
  onPostalCodeBlur,
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

  useEffect(() => {
    if (errors.operatingName?.message) {
      setShowOptionalIdentification(true);
    }
  }, [errors.operatingName?.message]);

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostalProgress(getPostalCodeProgress(e.target.value || ""));
    onPostalCodeChange?.();
  };

  const handlePostalCodeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setPostalProgress(getPostalCodeProgress(e.target.value || ""));
    onPostalCodeBlur?.();
  };

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
          expanded={showOptionalIdentification}
          onToggle={() => setShowOptionalIdentification((v) => !v)}
        />

        <div
          inert={!showOptionalIdentification}
          aria-hidden={!showOptionalIdentification}
          className={`transition-[max-height,opacity,padding] duration-300 ease-in-out ${
            showOptionalIdentification
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

      <FormSection
        title={
          <Clarification
            term={tenantFieldContent.mailingAddress.term}
            description={tenantFieldContent.mailingAddress.description}
          />
        }
      >
        <FormGrid>
          {TENANT_FIELDS.address.map((field) => {
            const isPostalCodeField = field.name === "address.postalCode";

            return (
              <div key={field.name} className="space-y-1">
                {field.name === "address.province" ? (
                  <SelectWithChanges<TenantFormInput>
                    label={field.label}
                    name={field.name}
                    options={[...CANADA_PROVINCE_TERRITORY_OPTIONS]}
                    error={errors.address?.province?.message}
                  />
                ) : (
                  <InputWithChanges<TenantFormInput>
                    label={field.label}
                    name={field.name}
                    rules={field.rules}
                    formatOnChange={field.formatOnChange}
                    onChange={
                      isPostalCodeField ? handlePostalCodeChange : undefined
                    }
                    onBlur={
                      isPostalCodeField ? handlePostalCodeBlur : undefined
                    }
                    error={errors[field.name as keyof TenantFormInput]?.message}
                  />
                )}
                {isPostalCodeField && postalProgress.text && (
                  <p
                    className={`text-xs ${
                      postalProgress.tone === "error"
                        ? "text-red-600"
                        : postalProgress.tone === "warning"
                          ? "text-amber-600"
                          : postalProgress.tone === "success"
                            ? "text-emerald-700"
                            : "text-slate-500"
                    }`}
                  >
                    {postalProgress.text}
                  </p>
                )}
              </div>
            );
          })}
        </FormGrid>
      </FormSection>

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

      {showMembership && (
        <FormSection title="Membership">
          <FormGrid>
            <InputWithChanges<TenantFormInput>
              label="Invite members (emails)"
              name="memberEmails"
              error={errors.memberEmails?.message}
            />
          </FormGrid>
        </FormSection>
      )}
    </>
  );
}
