//app/contacts/[id]/edit/EditContactForm.tsx
"use client";
import { use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import { contactSchema, ContactFormValues } from "@/lib/validations/contact";
import { upsertContactPEA } from "@/db/actions/contact";
import { getFieldChanges, ChangeEntry } from "@/utils/formChanges";

import FormLayout from "@/components/form/FormLayout";
// import FormSection from "@/components/form/FormSection";
// import InputWithChanges from "@/components/form/InputWithChanges";
import { FormChangeProvider } from "@/components/form/FormChangeContext";
// import SectionDisclosure from "@/components/section-disclosure";
// import { Clarification } from "@/components/Clarification";
import formatPostalCode from "@/utils/formatters/postalCode";
import { registerWithOnBlurFormat } from "@/utils/formRegister";
import formatPhone from "@/utils/formatters/phone";
import { ContactFormFields } from "@/components/contact/form-fields";

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
  //TODO: validated params.id against the user's permissions in the upsertContactPEA action(Never trust the ID coming from the client-side URL alone)
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
          <ContactFormFields
            errors={errors}
            showOptionalIdentity={showOptionalIdentity}
            setShowOptionalIdentity={setShowOptionalIdentity}
            showOptionalContact={showOptionalContact}
            setShowOptionalContact={setShowOptionalContact}
          />
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

          ....
        </form>
      </FormChangeProvider>
    </FormLayout>
  );
}
*/
