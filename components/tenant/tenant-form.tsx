"use client";

import { FieldErrors } from "react-hook-form";
import { TenantFormInput } from "@/lib/validations/tenant-schema";
import FormSection from "@/components/form/form-section";
import InputWithChanges from "@/components/form/input-with-changes";
import SelectWithChanges from "@/components/form/select-with-changes";
import { FormGrid } from "@/components/form/form-grid";

interface TenantFormProps {
  errors: FieldErrors<TenantFormInput>;
  showMembership?: boolean;
}

const TENANT_FIELDS = {
  mandatory: [
    {
      label: "Organization Name",
      name: "coreName" as const,
      rules: { required: "Organization name is required" },
    },
    {
      label: "Legal Name Ending",
      name: "legalNameEnding" as const,
      rules: {},
    },
  ],
  optional: [
    {
      label: "Business Number",
      name: "businessNumber" as const,
      rules: {},
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
      {/* General Information Section */}
      <FormSection title="General Information">
        <FormGrid>
          {TENANT_FIELDS.mandatory.map((field) => {
            // For legalNameEnding, render as select instead of input
            if (field.name === "legalNameEnding") {
              return (
                <SelectWithChanges<TenantFormInput>
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  error={errors[field.name]?.message}
                  options={[
                    { label: "Inc.", value: "Inc." },
                    { label: "Corp.", value: "Corp." },
                    { label: "Ltd", value: "Ltd" },
                    { label: "Limited", value: "Limited" },
                    { label: "Incorporated", value: "Incorporated" },
                    { label: "Corporation", value: "Corporation" },
                  ]}
                />
              );
            }
            return (
              <InputWithChanges<TenantFormInput>
                key={field.name}
                label={field.label}
                name={field.name}
                rules={field.rules}
                error={errors[field.name]?.message}
              />
            );
          })}
        </FormGrid>
      </FormSection>

      {/* Optional Section */}
      <FormSection title="Optional">
        <FormGrid>
          {TENANT_FIELDS.optional.map((field) => (
            <InputWithChanges<TenantFormInput>
              key={field.name}
              label={field.label}
              name={field.name}
              rules={field.rules}
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
