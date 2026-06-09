"use client";

import { useState } from "react";
import { FieldErrors } from "react-hook-form";
import { ContactFormInput } from "@/lib/validations/contact-schema";
import FormSection from "@/components/form/form-section";
import InputWithChanges from "@/components/form/input-with-changes";
import SectionDisclosure from "@/components/section-disclosure";
import { IDENTITY_FIELDS, CONTACT_FIELDS } from "@/constants/contact-fields";
import { FormGrid } from "../form/form-grid";
import { getPostalCodeProgress } from "@/utils/validators/postalCodeProgress";

interface ContactFormProps {
  errors: FieldErrors<ContactFormInput>;
  showOptionalIdentity: boolean;
  setShowOptionalIdentity: (
    val: boolean | ((prev: boolean) => boolean),
  ) => void;
  showOptionalContact: boolean;
  setShowOptionalContact: (val: boolean | ((prev: boolean) => boolean)) => void;
  onPostalCodeChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPostalCodeBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  hideCountryField?: boolean;
  readOnlyEmail?: boolean;
}

export function ContactForm({
  errors,
  showOptionalIdentity,
  setShowOptionalIdentity,
  showOptionalContact,
  setShowOptionalContact,
  onPostalCodeChange,
  onPostalCodeBlur,
  hideCountryField = false,
  readOnlyEmail = false,
}: ContactFormProps) {
  const [postalProgress, setPostalProgress] = useState({
    text: "",
    tone: "neutral" as const,
  });

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostalProgress(getPostalCodeProgress(e.target.value || ""));
    onPostalCodeChange?.(e);
  };

  const handlePostalCodeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setPostalProgress(getPostalCodeProgress(e.target.value || ""));
    onPostalCodeBlur?.(e);
  };

  return (
    <>
      {/* Identity Section */}
      <FormSection title="Identity">
        <FormGrid>
          {IDENTITY_FIELDS.mandatory.map((field) => (
            <InputWithChanges<ContactFormInput>
              key={field.name}
              {...field}
              error={errors[field.name]?.message}
            />
          ))}
        </FormGrid>

        <SectionDisclosure
          label="Optional"
          expanded={showOptionalIdentity}
          onToggle={() => setShowOptionalIdentity((v) => !v)}
        />

        <div
          inert={!showOptionalIdentity}
          aria-hidden={!showOptionalIdentity} //remove from accessibility tree when hidden
          className={`overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-in-out
          ${showOptionalIdentity ? "max-h-[400px] p-1 opacity-100" : "max-h-0 p-0 opacity-0"}`}
        >
          <FormGrid>
            {IDENTITY_FIELDS.optional.map((field) => (
              <InputWithChanges<ContactFormInput>
                key={field.name}
                {...field}
                error={errors[field.name]?.message}
              />
            ))}
          </FormGrid>
        </div>
      </FormSection>

      {/* Contact Section */}
      <FormSection title="Contact">
        <FormGrid>
          {CONTACT_FIELDS.mandatory.map((field) => {
            const isPostalCodeField = field.name === "postalCode";
            const isEmailField = field.name === "email";

            return (
              <div key={field.name} className="space-y-1">
                <InputWithChanges<ContactFormInput>
                  {...field}
                  error={errors[field.name]?.message}
                  readOnly={isEmailField && readOnlyEmail}
                  onChange={
                    isPostalCodeField ? handlePostalCodeChange : undefined
                  }
                  onBlur={isPostalCodeField ? handlePostalCodeBlur : undefined}
                />
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
        <SectionDisclosure
          label="Optional"
          expanded={showOptionalContact}
          onToggle={() => setShowOptionalContact((v) => !v)}
        />
        <div
          inert={!showOptionalContact}
          aria-hidden={!showOptionalContact} //remove from accessibility tree when hidden
          className={`overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-in-out
          ${showOptionalContact ? "max-h-[400px] p-1 opacity-100" : "max-h-0 p-0 opacity-0"}`}
        >
          <FormGrid>
            {CONTACT_FIELDS.optional
              .filter(
                (field) => !(hideCountryField && field.name === "country"),
              )
              .map((field) => (
                <InputWithChanges<ContactFormInput>
                  key={field.name}
                  {...field}
                  error={errors[field.name]?.message}
                />
              ))}
          </FormGrid>
        </div>
      </FormSection>
    </>
  );
}
