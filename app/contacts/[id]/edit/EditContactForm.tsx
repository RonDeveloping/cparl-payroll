//app/contacts/[id]/edit/EditContactForm.tsx
"use client";
import { use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import { contactSchema, ContactFormValues } from "@/lib/schemas/contact";
import { updateOrCreateContact } from "@/utils/contact";
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

  const onCreateOrConfirm = async (data: ContactFormValues) => {
    try {
      const result = await updateOrCreateContact(data, params.id);
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
    {
      label: (
        <Clarification
          term="Display Name"
          description="This may help a reader pick whom it refers to..."
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
          onSubmit={handleSubmit(onCreateOrConfirm)}
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
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b">
              Identity
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             
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
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWithChanges<ContactFormValues>
                  label={
                    <Clarification
                      term="Middle Name"
                      description="This field can be beneficial if you wish to provide a more complete identification in cases where multiple individuals share the same given names and family names."
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
                      description="This may help a reader pick whom it refers to in lists in a specific context more easily, such as 'Dr. Smith' in a clinic group or a name not in English. If left blank, 'Given Name' +'Middle Name' if available + 'Family Name' + aka 'Nickname' if available displays instead."
                    />
                  }
                  name="displayName"
                />
              </div>
            )}
          </section>

          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b">
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
