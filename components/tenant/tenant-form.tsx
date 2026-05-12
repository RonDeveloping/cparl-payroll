"use client";

import { FieldErrors } from "react-hook-form";
import { TenantFormInput } from "@/lib/validations/tenant-schema";
import FormSection from "@/components/form/form-section";
import InputWithChanges from "@/components/form/input-with-changes";
import { FormGrid } from "@/components/form/form-grid";
import formatBusinessNumber from "@/utils/formatters/businessNumber";
import { Clarification } from "@/components/clarification";

interface TenantFormProps {
  errors: FieldErrors<TenantFormInput>;
  showMembership?: boolean;
}

const TENANT_FIELDS = {
  general: [
    {
      label: "Legal Name",
      name: "coreName" as const,
      rules: { required: "Legal name is required" },
      placeholder: "1234567 Cananda Inc.",
      formatOnChange: undefined,
    },
    {
      label: "Operating Name",
      name: "operatingName" as const,
      rules: {},
      placeholder: "All Stuff Depot",
      formatOnChange: undefined,
    },
    {
      label: "Business Number",
      name: "businessNumber" as const,
      rules: {},
      placeholder: "999-999-999 RP 0001",
      formatOnChange: formatBusinessNumber,
      maxLength: 19, // "999-999-999 RP 0001" is 19 characters
    },
  ],
  contact: [
    {
      label: "Email",
      name: "email" as const,
      rules: {},
      type: "email",
    },
    {
      label: "Phone",
      name: "phone" as const,
      rules: {},
      type: "tel",
    },
  ],
  address: [
    {
      label: "Street",
      name: "address.street" as const,
      rules: {},
    },
    {
      label: "City",
      name: "address.city" as const,
      rules: {},
    },
    {
      label: "Province",
      name: "address.province" as const,
      rules: {},
    },
    {
      label: "Postal Code",
      name: "address.postalCode" as const,
      rules: {},
    },
  ],
};

export function TenantForm({ errors, showMembership }: TenantFormProps) {
  return (
    <>
      {/* Identification Section */}
      <FormSection title="Identification">
        <FormGrid>
          <InputWithChanges<TenantFormInput>
            label="Legal Name"
            name="coreName"
            placeholder="e.g. 1234567 Canada Inc."
            rules={{ required: "Legal name is required" }}
            error={errors.coreName?.message}
          />
          <InputWithChanges<TenantFormInput>
            label={
              <Clarification
                term="Operating As (O/A)"
                description={
                  'This helps employees recognize the employer on documents such as T4 slips, normally registered as a "Trade/Business Name".'
                }
              />
            }
            name="operatingName"
            placeholder="e.g. All Stuff Depot"
            rules={{}}
            error={errors.operatingName?.message}
          />
          <InputWithChanges<TenantFormInput>
            label={
              <Clarification
                term="Business Number"
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
      </FormSection>

      {/* Contact Section */}
      <FormSection title="Contact">
        <FormGrid>
          <InputWithChanges<TenantFormInput>
            label={
              <Clarification
                term="Attention"
                description="Contact person name to address in emails or phone calls."
              />
            }
            name="contactPerson"
            placeholder="e.g. Jane Doe"
            rules={{}}
            error={errors.contactPerson?.message}
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

      {/* Address Section */}
      <FormSection title="Address">
        <FormGrid>
          {TENANT_FIELDS.address.map((field) => (
            <InputWithChanges<TenantFormInput>
              key={field.name}
              label={field.label}
              name={field.name}
              rules={field.rules}
              error={errors[field.name as keyof TenantFormInput]?.message}
            />
          ))}
        </FormGrid>
      </FormSection>

      {showMembership && (
        <FormSection title="Membership">
          <FormGrid>
            <InputWithChanges<TenantFormInput>
              label="Invite Members (emails)"
              name="memberEmails"
              error={errors.memberEmails?.message}
            />
          </FormGrid>
        </FormSection>
      )}
    </>
  );
}
