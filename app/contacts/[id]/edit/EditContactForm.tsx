//app/contacts/[id]/edit/EditContactForm.tsx
"use client";
import { use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { contactSchema, ContactFormValues } from "@/lib/schemas/contact";
import { updateOrCreateContact } from "@/utils/contact";
import FormLayout from "@/components/FormLayout";
import { Clarification } from "@/components/Clarification";
import { useState } from "react";
import SectionDisclosure from "@/components/SectionDisclosure";
import { getFieldChanges, ChangeEntry } from "@/utils/formChanges";
import InputWithChanges from "@/components/InputWithChanges";

interface EditContactFormProps {
  paramsPromise: Promise<{ id: string }>;
  initialData: ContactFormValues;
}

export default function EditContactForm({
  paramsPromise,
  initialData,
}: EditContactFormProps) {
  //in the client component, unwrap a promise params with use() hook
  const params = use(paramsPromise);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    getValues,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    // Use 'values' as 'defaultValue' won't update even initialData changes
    values: initialData,
  });

  const changes: ChangeEntry<unknown>[] = getFieldChanges(
    initialData, // before
    getValues(), // current values
    dirtyFields, // react-hook-form dirtyFields
  );

  const changeCount = changes.length;

  const [showB4Change, setShowB4Change] = useState(false);
  const [showOptional, setShowOptional] = useState(() => {
    // Auto-expand if optional fields already have data
    return Boolean(
      initialData.middleName || initialData.nickName || initialData.displayName,
    );
  });

  const onCreateOrConfirm = async (data: ContactFormValues) => {
    try {
      const result = await updateOrCreateContact(data, params.id);

      if (result?.id) {
        router.refresh();
        // Navigate to the profile of the contact (new or updated)
        router.push(`/contacts/${result.id}`);
        // This "passes" the ID back to the UI flow
      }
    } catch (error) {
      // This catches the "Database error" thrown by safe.ts
      console.error("Form submission failed", error);
      alert(
        "Changes could not be saved; Please try again or Check for errors.",
      );
    }
  };

  return (
    <FormLayout
      domain="contacts"
      id={params.id}
      formId="contact-form"
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      changeLabel=" Change(s) on the Contact Form"
      changeCount={changeCount}
      optionalExpanded={showOptional}
      showChanges={showB4Change}
      onEyeToggle={() => setShowB4Change((v) => !v)}
    >
      <form
        id="contact-form"
        onSubmit={handleSubmit(onCreateOrConfirm)}
        className="space-y-8"
      >
        {/* IDENTITY SECTION */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b">
            Identity
          </h2>
          {/* Primary identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pass 'register' to track the value and 'error' to show validation messages */}
            <InputWithChanges
              changes={changes}
              showChanges={showB4Change}
              label="Given Name"
              name="givenName"
              register={register}
              error={errors.givenName?.message}
            />
            <InputWithChanges
              changes={changes}
              showChanges={showB4Change}
              label="Family Name"
              name="familyName"
              register={register}
              error={errors.familyName?.message}
            />
          </div>
          <SectionDisclosure
            label="Optional"
            expanded={showOptional}
            onToggle={() => setShowOptional((v) => !v)}
          />
          {/* Optional fields */}
          {showOptional && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputWithChanges
                changes={changes}
                showChanges={showB4Change}
                label={
                  <Clarification
                    term="Middle Name"
                    description="This field can be beneficial if you wish to provide a more complete identification in cases where multiple individuals share the same given names and family names."
                  />
                }
                name="middleName"
                register={register}
                error={errors.middleName?.message}
              />
              <InputWithChanges
                changes={changes}
                showChanges={showB4Change}
                label="Nickname"
                name="nickName"
                register={register}
                placeholder="e.g. Bob"
              />
              <InputWithChanges
                changes={changes}
                showChanges={showB4Change}
                label={
                  <Clarification
                    term="Display Name"
                    description="This may help a reader pick whom it refers to in lists in a specific context more easily, such as 'Dr. Smith' in a clinic group or a name not in English. If left blank, 'Given Name' +'Middle Name' if available + 'Family Name' + aka 'Nickname' if available displays instead."
                  />
                }
                name="displayName"
                register={register}
                placeholder="e.g. Dr. Smith"
              />
            </div>
          )}
        </section>

        {/* CONTACT & ADDRESS SECTION */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b">
            Contact & Address
          </h2>
          <div className="space-y-4">
            <InputWithChanges
              changes={changes}
              showChanges={showB4Change}
              label="Primary Email"
              name="email"
              register={register}
              error={errors.email?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputWithChanges
                changes={changes}
                showChanges={showB4Change}
                label="Phone Number"
                name="phone"
                register={register}
                error={errors.phone?.message}
              />
              <InputWithChanges
                changes={changes}
                showChanges={showB4Change}
                label="Postal Code"
                name="postalCode"
                register={register}
                error={errors.postalCode?.message}
              />
            </div>

            <InputWithChanges
              changes={changes}
              showChanges={showB4Change}
              label="Street Address"
              name="street"
              register={register}
              error={errors.street?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputWithChanges
                changes={changes}
                showChanges={showB4Change}
                label="City"
                name="city"
                register={register}
              />
              <InputWithChanges
                changes={changes}
                showChanges={showB4Change}
                label="Province"
                name="province"
                register={register}
              />
              <InputWithChanges
                changes={changes}
                showChanges={showB4Change}
                label="Country"
                name="country"
                register={register}
              />
            </div>
          </div>
        </section>
      </form>
    </FormLayout>
  );
}
