// components/RegisterForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGISTER_FIELDS } from "@/constants/user-register-fields";
import {
  registerSchema,
  UserRegistrationInput,
} from "@/lib/validations/user-register-schema";
import { upsertUser } from "@/lib/actions/user";
import { useMemo, useState } from "react";
import { FormGrid } from "../form/form-grid";
import InputWithChanges from "../form/input-with-changes";
import { SmartFormProvider } from "../form/form-change-context";
import formatPhone from "@/utils/formatters/phone";
import { registerWithOnBlurFormat } from "@/utils/formRegister";
import { Spinner } from "../shared/spinner";
import { BUTTON_VARIANTS } from "@/constants/styles";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UserRegistrationInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    reValidateMode: "onBlur", // Re-validate on blur (important for async validations)
  });

  const router = useRouter();

  const registerFormatted = useMemo(
    () =>
      registerWithOnBlurFormat<UserRegistrationInput>(register, {
        phone: formatPhone,
      }),
    [register],
  );

  const onSubmit = async (data: UserRegistrationInput) => {
    setServerError(null);

    const result = await upsertUser(data);

    if (!result.success) {
      setServerError(result.error ?? "An unexpected error occurred.");
      return;
    }
    console.log("Registration successful:", result.data);
    router.push("/auth/veri-request");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <div className="text-red-600 bg-red-100 p-2 rounded">{serverError}</div>
      )}

      <SmartFormProvider<UserRegistrationInput>
        value={{
          register: registerFormatted, // Pass the RHF register function
          changes: [], // No "changes" for a new registration
          showChanges: false,
        }}
      >
        <FormGrid>
          {REGISTER_FIELDS.mandatory.map((field) => (
            <InputWithChanges<UserRegistrationInput>
              key={field.name}
              {...field}
              error={errors[field.name]?.message}
            />
          ))}
        </FormGrid>

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            {...register("acceptTerms")}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm">
            I agree to the{" "}
            <a href="/terms" className="underline">
              Terms and Conditions
            </a>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-red-500 text-sm">{errors.acceptTerms.message}</p>
        )}

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={cn(BUTTON_VARIANTS.primary, "relative")}
        >
          {isSubmitting && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}
          {/* The Text - its position remains stable */}
          <span className={cn(isSubmitting && "opacity-0")}>Register</span>
        </button>
      </SmartFormProvider>
    </form>
  );
}
/*
Most professional development teams (including those at Vercel, Google, and Airbnb) prefer kebab-case for files for three technical reasons:

Case Sensitivity Issues: macOS and Windows are often case-insensitive, but Linux (where your code is deployed/CI/CD) is case-sensitive. If you rename RegisterForm.tsx to registerform.tsx, git might not track the change on Windows, but your build will fail on Linux. Kebab-case avoids this entirely.

URL Consistency: In the Next.js app router, folders define your URLs. URLs are always lowercase (e.g., /user-settings). Using kebab-case across your entire src folder keeps your file system consistent with your routing.

Scanability: register-form.tsx is slightly easier to read in a dense file tree than RegisterForm.tsx, especially for people using screen readers or different IDE themes.
*/
