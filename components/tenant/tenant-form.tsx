"use client";
// components/tenant/tenant-form.tsx

import { useState } from "react";
import { FieldErrors } from "react-hook-form";
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

interface TenantFormProps {
  errors: FieldErrors<TenantFormInput>;
  showMembership?: boolean;
  getFieldValue: (
    fieldName: MailingAddressField<TenantFormInput>["name"],
  ) => unknown;
  setFieldValue: (
    fieldName: MailingAddressField<TenantFormInput>["name"],
    value: string,
  ) => void;
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
  showMembership,
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
  const optionalIdentificationExpanded =
    showOptionalIdentification || Boolean(errors.operatingName?.message);

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostalProgress(getPostalCodeProgress(e.target.value || ""));
  };

  const handlePostalCodeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setPostalProgress(getPostalCodeProgress(e.target.value || ""));
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
