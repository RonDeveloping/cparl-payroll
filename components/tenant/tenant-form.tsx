"use client";

import { FieldErrors } from "react-hook-form";
import { TenantFormInput } from "@/lib/validations/tenant-schema";
import FormSection from "@/components/form/form-section";
import InputWithChanges from "@/components/form/input-with-changes";
import { FormGrid } from "@/components/form/form-grid";
import formatBusinessNumber from "@/utils/formatters/businessNumber";

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
    {
      label: "Country",
      name: "address.country" as const,
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
          {TENANT_FIELDS.general.map((field) => (
            <InputWithChanges<TenantFormInput>
              key={field.name}
              label={field.label}
              name={field.name}
              placeholder={field.placeholder}
              formatOnChange={field.formatOnChange}
              rules={field.rules}
              maxLength={field.maxLength}
              error={errors[field.name]?.message}
            />
          ))}
        </FormGrid>
      </FormSection>

      {/* Contact Information Section */}
      <FormSection title="Contact Information">
        <FormGrid>
          {TENANT_FIELDS.contact.map((field) => (
            <InputWithChanges<TenantFormInput>
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type as "email" | "tel"}
              rules={field.rules}
              error={errors[field.name as keyof TenantFormInput]?.message}
            />
          ))}
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
