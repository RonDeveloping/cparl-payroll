//app/contacts/[id]/edit/EditContactForm.tsx
"use client";
import { use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import { contactSchema, ContactFormValues } from "@/lib/schemas/contact";
import { upsertContactPEA } from "@/utils/contact";
import { getFieldChanges, ChangeEntry } from "@/utils/formChanges";

import FormLayout from "@/components/form/FormLayout";
import FormSection from "@/components/form/FormSection";
import InputWithChanges from "@/components/form/InputWithChanges";
import { FormChangeProvider } from "@/components/form/FormChangeContext";
import SectionDisclosure from "@/components/SectionDisclosure";
import { Clarification } from "@/components/Clarification";
import formatPostalCode from "@/lib/formatters/postalCode";
import { registerWithOnBlurFormat } from "@/utils/formRegister";
import formatPhone from "@/lib/formatters/phone";

interface EditContactFormProps {
  paramsPromise: Promise<{ id: string }>;
  initialData: ContactFormValues;
}

export default function EditContactForm({
  paramsPromise,
  initialData,
}: EditContactFormProps) {
  const params = use(paramsPromise);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    getValues,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    values: initialData,
    shouldFocusError: false, // Prevents auto-focus on first error field upon submission
    mode: "onBlur", // Validation triggers when a field loses focus
  });

  const currentValues = getValues(); // always up-to-date to help comparison in InputWithChanges to id change and show "before" value.

  const registerFormatted = useMemo(
    () =>
      registerWithOnBlurFormat<ContactFormValues>(register, {
        postalCode: formatPostalCode,
        phone: formatPhone,
      }),
    [register],
  );

  const changes: ChangeEntry<unknown>[] = useMemo(
    () => getFieldChanges(initialData, currentValues, dirtyFields),
    [initialData, currentValues, dirtyFields],
  );

  const changeCount = changes.length;
  const [showB4Change, setShowB4Change] = useState(false);

  const [showOptionalIdentity, setShowOptionalIdentity] = useState(
    Boolean(
      initialData.middleName || initialData.nickName || initialData.displayName,
    ),
  );

  const [showOptionalContact, setShowOptionalContact] = useState(
    Boolean(
      initialData.phone ||
      initialData.street ||
      initialData.city ||
      initialData.province ||
      initialData.country,
    ),
  );
  // Form submission handler where this data is coming from RHF's handleSubmit of RHF state, not DOM
  const onCreateOrConfirm = async (data: ContactFormValues) => {
    try {
      const result = await upsertContactPEA(data, params.id);
      if (result?.id) {
        router.refresh();
        router.push(`/contacts/${result.id}`);
      }
    } catch (error) {
      console.error("Form submission failed", error);
      alert("Changes not saved; please check for errors.");
    }
  };

  /** Field definitions for mapping */
  type FieldDef = {
    label: React.ReactNode;
    name: keyof ContactFormValues;
    error?: string | undefined;
  };

  type FieldDefWithError = FieldDef & { error: string | undefined };

  const mandotoryIdentityFields: FieldDefWithError[] = [
    {
      label: "Given Name",
      name: "givenName",
      error: errors.givenName?.message,
    },
    {
      label: "Family Name",
      name: "familyName",
      error: errors.familyName?.message,
    },
  ];

  const optionalIdentityFields: FieldDef[] = [
    {
      label: (
        <Clarification
          term="Middle Name"
          description="This field can be beneficial if you wish to provide a more complete identification..."
        />
      ),
      name: "middleName",
      error: errors.middleName?.message,
    },
    { label: "Nickname", name: "nickName" },
    { label: "Prefix", name: "prefix" },
    { label: "Suffix", name: "suffix" },
    {
      label: (
        <Clarification
          term="Customized Display Name"
          description="The default display name is 'Prefix'+'Given Name' + 'Middle Name' + 'Family Name' + 'Suffix'+ aka 'Nickname'. You can override that by providing a customized one, even in a different language, in this field."
        />
      ),
      name: "displayName",
    },
  ];

  const mandotoryContactFields: FieldDefWithError[] = [
    { label: "Email", name: "email", error: errors.email?.message },
    {
      label: (
        <Clarification
          term="Postal Code"
          description="Communication may be tailored to your pon postal code."
        />
      ),
      name: "postalCode",
      error: errors.postalCode?.message,
    },
  ];

  const optionalContactFields: FieldDef[] = [
    { label: "Phone", name: "phone", error: errors.phone?.message },
    { label: "Street Address", name: "street", error: errors.street?.message },
    { label: "City", name: "city" },
    { label: "Province", name: "province" },
    { label: "Country", name: "country" },
  ];

  return (
    <FormLayout
      domain="contacts"
      id={params.id}
      formId="contact-form"
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      changeLabel=" Change(s) on the Contact Form"
      changeCount={changeCount}
      showChanges={showB4Change}
      onEyeToggle={() => setShowB4Change((v) => !v)}
    >
      <FormChangeProvider<ContactFormValues>
        value={{
          changes,
          showChanges: showB4Change,
          register: registerFormatted,
        }}
      >
        <form
          id="contact-form"
          onSubmit={handleSubmit(onCreateOrConfirm)} //handleSubmit here in RHF reads the form data, validates and build a plain object called data, then calls onCreateOrConfirm with that data.
          className="space-y-4"
        >
          {/* Identity Section */}
          <FormSection title="Identity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mandotoryIdentityFields.map((f) => (
                <InputWithChanges<ContactFormValues> key={f.name} {...f} />
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
                {optionalIdentityFields.map((f) => (
                  <InputWithChanges<ContactFormValues> key={f.name} {...f} />
                ))}
              </div>
            </div>
          </FormSection>

          {/* Contact Section */}
          <FormSection title="Contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mandotoryContactFields.map((f) => (
                <InputWithChanges<ContactFormValues> key={f.name} {...f} />
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
                {optionalContactFields.map((f) => (
                  <InputWithChanges<ContactFormValues> key={f.name} {...f} />
                ))}
              </div>
            </div>
          </FormSection>
        </form>
      </FormChangeProvider>
    </FormLayout>
  );
}

/*
  return (
    <FormLayout
      ...
    >
      <FormChangeProvider<ContactFormValues>
        value={{
          changes,
          showChanges: showB4Change,
          register,
        }}
      >
        <form
          id="contact-form"
          onSubmit={handleSubmit(onCreateOrConfirm)}
          className="space-y-8"
        >
          <section className="...">
              Identity
            </h2>
            
            <div className="...">
             
              <InputWithChanges<ContactFormValues>
                label="Given Name"
                name="givenName"
                error={errors.givenName?.message}
              />
              <InputWithChanges<ContactFormValues>
                label="Family Name"
                name="familyName"
                error={errors.familyName?.message}
              />
            </div>
            <SectionDisclosure
              label="Optional"
              expanded={showOptional}
              onToggle={() => setShowOptional((v) => !v)}
            />
            
            {showOptional && (
              <div className="...">
                <InputWithChanges<ContactFormValues>
                  label={
                    <Clarification
                      term="Middle Name"
                      description="..."
                    />
                  }
                  name="middleName"
                  error={errors.middleName?.message}
                />
                <InputWithChanges<ContactFormValues>
                  label="Nickname"
                  name="nickName"
                />
                <InputWithChanges<ContactFormValues>
                  label={
                    <Clarification
                      term="Display Name"
                      description="..."
                    />
                  }
                  name="displayName"
                />
              </div>
            )}
          </section>

          <section className="...">
              Contact
            </h2>
            <div className="space-y-4">
              <InputWithChanges<ContactFormValues>
                label="Email"
                name="email"
                error={errors.email?.message}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWithChanges<ContactFormValues>
                  label="Phone"
                  name="phone"
                  error={errors.phone?.message}
                />

                <InputWithChanges<ContactFormValues>
                  label="Postal Code"
                  name="postalCode"
                  error={errors.postalCode?.message}
                />
              </div>

              <InputWithChanges<ContactFormValues>
                label="Street Address"
                name="street"
                error={errors.street?.message}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputWithChanges<ContactFormValues>
                  label="City"
                  name="city"
                />
                <InputWithChanges<ContactFormValues>
                  label="Province"
                  name="province"
                />
                <InputWithChanges<ContactFormValues>
                  label="Country"
                  name="country"
                />
              </div>
            </div>
          </section>
        </form>
      </FormChangeProvider>
    </FormLayout>
  );
}
*/
