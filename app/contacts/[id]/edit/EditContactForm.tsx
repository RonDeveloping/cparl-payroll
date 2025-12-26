//app/contacts/[id]/edit/EditContactForm.tsx
"use client";
// 1. ALL IMPORTS FIRST
import { use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Building } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { contactSchema, ContactFormValues } from "@/lib/schemas/contact"; // Import the shared type

import { UseFormRegister, FieldValues, Path } from "react-hook-form";
import { updateOrCreateContact } from "@/lib/actions/contact";

interface EditContactFormProps {
  paramsPromise: Promise<{ id: string }>;
  initialData: ContactFormValues;
}

// 2. NOW THE COMPONENT
export default function EditContactForm({
  paramsPromise,
  initialData,
}: EditContactFormProps) {
  //in the client component, unwrap a promise params with use() hook
  const params = use(paramsPromise);
  const isNew = params.id === "new";

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    // Use 'values' so the form updates if initialData changes
    defaultValues: initialData,
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const result = await updateOrCreateContact(data, params.id);

      if (result?.id) {
        router.refresh();
        // 2. Navigate to the profile of the contact (new or updated)
        // This "passes" the ID back to the UI flow
        router.push(`/contacts/${result.id}`);
      }
    } catch (error) {
      // This catches the "Database error" thrown by safe.ts
      console.error("Form submission failed", error);
      alert("Could not save contact. Check for duplicate.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href={isNew ? "/contacts" : `/contacts/${params.id}`}
          className="flex items-center text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={16} className="mr-1" />{" "}
          {isNew ? "Back to List" : "Back to Profile"}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold">
            Access
          </span>
          <Building size={14} className="text-purple-600" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section: Identity */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b">
            {isNew ? "Create New Contact" : "Edit Identity"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Dr. Robert Smith Jr."
            />
          </div>
        </section>

        {/* Section: Contact & Address */}
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
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-2 rounded-lg font-medium hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Save size={18} />
                {isNew ? "Create Contact" : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// We use Generics <T> so this component works with ANY form schema
interface InputGroupProps<T extends FieldValues> {
  label: string;
  name: Path<T>; // Ensures 'name' must exist in your Zod schema
  register: UseFormRegister<T>;
  error?: string;
  placeholder?: string;
  type?: string; // Added for passwords, numbers, etc.
}

//Reusable Input Component
function InputGroup<T extends FieldValues>({
  label,
  name,
  register,
  error,
  placeholder,
  type = "text",
}: InputGroupProps<T>) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
        {label}
      </label>
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-lg border transition-all text-sm outline-none
          ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-200 focus:ring-2 focus:ring-blue-500"
          }`}
      />
      {error && (
        <span className="text-[10px] text-red-500 font-medium ml-1">
          {error}
        </span>
      )}
    </div>
  );
}
