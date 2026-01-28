"use client";

import { FieldErrors } from "react-hook-form";
import { ContactFormInput } from "@/lib/validations/contact-schema";
import FormSection from "@/components/form/form-section";
import InputWithChanges from "@/components/form/input-with-changes";
import SectionDisclosure from "@/components/section-disclosure";
import { IDENTITY_FIELDS, CONTACT_FIELDS } from "@/constants/contact-fields";
import { FormGrid } from "../form/form-grid";

interface ContactFormProps {
  errors: FieldErrors<ContactFormInput>;
  showOptionalIdentity: boolean;
  setShowOptionalIdentity: (
    val: boolean | ((prev: boolean) => boolean),
  ) => void;
  showOptionalContact: boolean;
  setShowOptionalContact: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export function ContactForm({
  errors,
  showOptionalIdentity,
  setShowOptionalIdentity,
  showOptionalContact,
  setShowOptionalContact,
}: ContactFormProps) {
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
          className={`overflow-hidden p-1 transition-[max-height] duration-300 ease-in-out
          ${showOptionalIdentity ? "max-h-[400px]" : "max-h-0"}`}
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
          {CONTACT_FIELDS.mandatory.map((field) => (
            <InputWithChanges<ContactFormInput>
              key={field.name}
              {...field}
              error={errors[field.name]?.message}
            />
          ))}
        </FormGrid>
        <SectionDisclosure
          label="Optional"
          expanded={showOptionalContact}
          onToggle={() => setShowOptionalContact((v) => !v)}
        />
        <div
          inert={!showOptionalContact}
          aria-hidden={!showOptionalContact} //remove from accessibility tree when hidden
          className={`overflow-hidden p-1 transition-[max-height] duration-300 ease-in-out
          ${showOptionalContact ? "max-h-[400px]" : "max-h-0"}`}
        >
          <FormGrid>
            {CONTACT_FIELDS.optional.map((field) => (
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
