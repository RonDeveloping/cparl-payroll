//app/contacts/[id]/edit/EditContactForm.tsx
"use client";
import { use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { contactSchema, ContactFormValues } from "@/lib/schemas/contact"; // Import the shared type

import { updateOrCreateContact } from "@/lib/actions/contact";
import FormLayout from "@/components/FormLayout";
import InputGroup from "@/components/InputGroup";

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
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    // Use 'values' so the form updates if initialData changes, otherwise defaultValue won't update even initialData changes
    values: initialData,
  });

  console.log("Is Form Dirty?", isDirty);
  console.log("Which fields are dirty?", dirtyFields);

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
        "Changes could not be saved; Please try again or Check for errors."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pass 'register' to track the value and 'error' to show validation messages */}
            <InputGroup
              label="Given Name"
              name="givenName"
              register={register}
              error={errors.givenName?.message}
            />
            <InputGroup
              label="Family Name"
              name="familyName"
              register={register}
              error={errors.familyName?.message}
            />
            <InputGroup
              label="Nickname"
              name="nickName"
              register={register}
              placeholder="e.g. Bob"
            />
            <InputGroup
              label="Display Name"
              name="displayName"
              register={register}
              placeholder="e.g. Dr. Robert Smith"
            />
          </div>
        </section>

        {/* CONTACT & ADDRESS SECTION */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b">
            Contact & Address
          </h2>
          <div className="space-y-4">
            <InputGroup
              label="Primary Email"
              name="email"
              register={register}
              error={errors.email?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup
                label="Phone Number"
                name="phone"
                register={register}
                error={errors.phone?.message}
              />
              <InputGroup
                label="Postal Code"
                name="postalCode"
                register={register}
                error={errors.postalCode?.message}
              />
            </div>

            <InputGroup
              label="Street Address"
              name="street"
              register={register}
              error={errors.street?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputGroup label="City" name="city" register={register} />
              <InputGroup
                label="Province"
                name="province"
                register={register}
              />
              <InputGroup label="Country" name="country" register={register} />
            </div>
          </div>
        </section>
      </form>
    </FormLayout>
  );
}
