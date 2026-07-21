"use client";

import type { ReactNode } from "react";
import { FieldErrors, FieldValues, Path } from "react-hook-form";
import FormSection from "@/components/form/form-section";
import InputWithChanges from "@/components/form/input-with-changes";
import SelectWithChanges from "@/components/form/select-with-changes";
import { FormGrid } from "@/components/form/form-grid";
import { Clarification } from "@/components/clarification";
import { CANADA_PROVINCE_TERRITORY_OPTIONS } from "@/constants/canada-provinces";
import { tenantFieldContent } from "@/constants/content";
import { getPostalLocationSuggestion } from "@/utils/validators/postalCodeLookup";
import type { PostalCodeProgressTone } from "@/utils/validators/postalCodeProgress";

export type MailingAddressField<TFormValues extends FieldValues> = {
  label: string;
  name: Path<TFormValues>;
  rules: Record<string, never>;
  formatOnChange?: (value: string) => string;
};

interface MailingAddressSectionProps<TFormValues extends FieldValues> {
  title?: ReactNode;
  fields: readonly MailingAddressField<TFormValues>[];
  errors: FieldErrors<TFormValues>;
  getFieldError: (fieldName: Path<TFormValues>) => string | undefined;
  isProvinceField: (fieldName: Path<TFormValues>) => boolean;
  isPostalCodeField: (fieldName: Path<TFormValues>) => boolean;
  onPostalCodeChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPostalCodeBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  postalProgress?: {
    text: string;
    tone: PostalCodeProgressTone;
  };
  postalLookup?: {
    postalCodeField: Path<TFormValues>;
    cityField: Path<TFormValues>;
    provinceField: Path<TFormValues>;
    getValue: (fieldName: Path<TFormValues>) => unknown;
    setValue: (fieldName: Path<TFormValues>, value: string) => void;
  };
}

export function MailingAddressSection<TFormValues extends FieldValues>({
  title,
  fields,
  getFieldError,
  isProvinceField,
  isPostalCodeField,
  onPostalCodeChange,
  onPostalCodeBlur,
  postalProgress,
  postalLookup,
}: MailingAddressSectionProps<TFormValues>) {
  const applyPostalCodeSuggestion = () => {
    if (!postalLookup) return;

    const postalCode = String(
      postalLookup.getValue(postalLookup.postalCodeField) ?? "",
    ).trim();
    const suggestion = getPostalLocationSuggestion(postalCode);
    if (!suggestion) return;

    if (suggestion.provinceCode) {
      const currentProvince = String(
        postalLookup.getValue(postalLookup.provinceField) ?? "",
      )
        .trim()
        .toUpperCase();
      if (!currentProvince) {
        postalLookup.setValue(
          postalLookup.provinceField,
          suggestion.provinceCode,
        );
      }
    }

    if (suggestion.city) {
      const currentCity = String(
        postalLookup.getValue(postalLookup.cityField) ?? "",
      ).trim();
      if (!currentCity) {
        postalLookup.setValue(postalLookup.cityField, suggestion.city);
      }
    }
  };

  return (
    <FormSection
      title={
        title ?? (
          <Clarification
            term={tenantFieldContent.mailingAddress.term}
            description={tenantFieldContent.mailingAddress.description}
          />
        )
      }
    >
      <FormGrid>
        {fields.map((field) => {
          const provinceField = isProvinceField(field.name);
          const postalCodeField = isPostalCodeField(field.name);

          return (
            <div key={field.name} className="space-y-1">
              {provinceField ? (
                <SelectWithChanges<TFormValues>
                  label={field.label}
                  name={field.name}
                  options={[...CANADA_PROVINCE_TERRITORY_OPTIONS]}
                  error={getFieldError(field.name)}
                />
              ) : (
                <InputWithChanges<TFormValues>
                  label={field.label}
                  name={field.name}
                  rules={field.rules}
                  formatOnChange={field.formatOnChange}
                  onChange={
                    postalCodeField
                      ? (e) => {
                          onPostalCodeChange?.(e);
                          applyPostalCodeSuggestion();
                        }
                      : undefined
                  }
                  onBlur={
                    postalCodeField
                      ? (e) => {
                          onPostalCodeBlur?.(e);
                          applyPostalCodeSuggestion();
                        }
                      : undefined
                  }
                  error={getFieldError(field.name)}
                />
              )}
              {postalCodeField && postalProgress?.text && (
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
  );
}
