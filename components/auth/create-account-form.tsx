// components/auth/user-register-form.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGISTER_FIELDS } from "@/constants/register-fields";
import {
  registerSchema,
  RegisterInput,
} from "@/lib/validations/register-schema";
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
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    reValidateMode: "onBlur", // Re-validate on blur (important for async validations)
  });

  const router = useRouter();

  const registerFormatted = useMemo(
    () =>
      registerWithOnBlurFormat<RegisterInput>(register, {
        phone: formatPhone,
      }),
    [register],
  );

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle Rate Limit (429) or Server Errors (500)
        setServerError(result.error || "An unexpected error occurred.");
        return;
      }

      // Success (Generic): Redirect to the verification request page and pass the email as a query parameter
      router.push(`/auth/veri-request?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      setServerError("Failed to connect to the server.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <div className="text-red-600 bg-red-100 p-2 rounded">{serverError}</div>
      )}

      <SmartFormProvider<RegisterInput>
        value={{
          register: registerFormatted, // Pass the RHF register function
          changes: [], // No "changes" for a new registration
          showChanges: false,
        }}
      >
        <FormGrid>
          {REGISTER_FIELDS.mandatory.map((field) => (
            <InputWithChanges<RegisterInput>
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
