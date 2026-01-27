"use client";

import { FieldErrors } from "react-hook-form";
import { ContactFormValues } from "@/lib/validations/contact";
import FormSection from "@/components/form/FormSection";
import InputWithChanges from "@/components/form/InputWithChanges";
import SectionDisclosure from "@/components/section-disclosure";
import { Clarification } from "@/components/clarification";
import { IDENTITY_FIELDS, CONTACT_FIELDS } from "@/constants/contact-fields";

// /** Field definitions for mapping */
// type FieldDef = {
//   label: React.ReactNode;
//   name: keyof ContactFormValues;
//   error?: string | undefined;
// };

// type FieldDefWithError = FieldDef & { error: string | undefined };

interface ContactFormFieldsProps {
  errors: FieldErrors<ContactFormValues>;
  showOptionalIdentity: boolean;
  setShowOptionalIdentity: (
    val: boolean | ((prev: boolean) => boolean),
  ) => void;
  showOptionalContact: boolean;
  setShowOptionalContact: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export function ContactFormFields({
  errors,
  showOptionalIdentity,
  setShowOptionalIdentity,
  showOptionalContact,
  setShowOptionalContact,
}: ContactFormFieldsProps) {
  // Move your field definition arrays here (mandatoryIdentityFields, etc.)
  // because they are specific to the UI layout.
  // const mandotoryIdentityFields: FieldDefWithError[] = [
  //   {
  //     label: "Given Name",
  //     name: "givenName",
  //     error: errors.givenName?.message,
  //   },
  //   {
  //     label: "Family Name",
  //     name: "familyName",
  //     error: errors.familyName?.message,
  //   },
  // ];

  // const optionalIdentityFields: FieldDef[] = [
  //   {
  //     label: (
  //       <Clarification
  //         term="Middle Name"
  //         description="This field can be beneficial if you wish to provide a more complete identification..."
  //       />
  //     ),
  //     name: "middleName",
  //     error: errors.middleName?.message,
  //   },
  //   { label: "Nickname", name: "nickName" },
  //   { label: "Prefix", name: "prefix" },
  //   { label: "Suffix", name: "suffix" },
  //   {
  //     label: (
  //       <Clarification
  //         term="Customized Display Name"
  //         description="The default display name is 'Prefix'+'Given Name' + 'Middle Name' + 'Family Name' + 'Suffix'+ aka 'Nickname'. You can override that by providing a customized one, even in a different language, in this field."
  //       />
  //     ),
  //     name: "displayName",
  //   },
  // ];

  // const mandotoryContactFields: FieldDefWithError[] = [
  //   { label: "Email", name: "email", error: errors.email?.message },
  //   {
  //     label: (
  //       <Clarification
  //         term="Postal Code"
  //         description="Communication may be tailored to your pon postal code."
  //       />
  //     ),
  //     name: "postalCode",
  //     error: errors.postalCode?.message,
  //   },
  // ];

  // const optionalContactFields: FieldDef[] = [
  //   { label: "Phone", name: "phone", error: errors.phone?.message },
  //   { label: "Street Address", name: "street", error: errors.street?.message },
  //   { label: "City", name: "city" },
  //   { label: "Province", name: "province" },
  //   { label: "Country", name: "country" },
  // ];

  return (
    <>
      {/* Identity Section */}
      <FormSection title="Identity">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {IDENTITY_FIELDS.mandatory.map((field) => (
            <InputWithChanges<ContactFormValues>
              key={field.name}
              {...field}
              error={errors[field.name]?.message}
            />
          ))}
        </div>
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
          <div className="mt-4 px-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {IDENTITY_FIELDS.optional.map((field) => (
              <InputWithChanges<ContactFormValues>
                key={field.name}
                {...field}
                error={errors[field.name]?.message}
              />
            ))}
          </div>
        </div>
      </FormSection>

      {/* Contact Section */}
      <FormSection title="Contact">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTACT_FIELDS.mandatory.map((field) => (
            <InputWithChanges<ContactFormValues>
              key={field.name}
              {...field}
              error={errors[field.name]?.message}
            />
          ))}
        </div>
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
          <div className="mt-4 px-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONTACT_FIELDS.optional.map((field) => (
              <InputWithChanges<ContactFormValues>
                key={field.name}
                {...field}
                error={errors[field.name]?.message}
              />
            ))}
          </div>
        </div>
      </FormSection>
    </>
  );
}
