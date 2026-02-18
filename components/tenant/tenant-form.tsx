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
      label: "Tenant Name",
      name: "name" as const,
      rules: { required: "Tenant name is required" },
    },
    {
      label: "URL Slug",
      name: "slug" as const,
      rules: {
        required: "URL slug is required",
        pattern: {
          value: /^[a-z0-9-]+$/,
          message:
            "Slug must contain only lowercase letters, numbers, and hyphens",
        },
      },
    },
    {
      label: "Legal Name",
      name: "legalName" as const,
      rules: { required: "Legal name is required" },
    },
  ],
  optional: [
    {
      label: "Business Number",
      name: "businessNumber" as const,
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
          {TENANT_FIELDS.mandatory.map((field) => (
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

      {showMembership && (
        <FormSection title="Membership">
          <FormGrid>
            <SelectWithChanges<TenantFormInput>
              label="Your Role"
              name="userRole"
              error={errors.userRole?.message}
              options={[
                { label: "Owner", value: "owner" },
                { label: "Admin", value: "admin" },
                { label: "Member", value: "member" },
              ]}
            />
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
