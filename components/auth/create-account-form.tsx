// components/auth/create-account-form.tsx

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
import { registerFormStyles } from "@/constants/styles";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

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
      //createUserSendEmailVeriRequest is called in the API route to ensure the transaction and email sending happen server-side
      const response = await fetch(ROUTES.API.REGISTER, {
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
      router.push(
        `${ROUTES.AUTH.CHECK_EMAIL}?email=${encodeURIComponent(data.email)}`,
      );
    } catch (err) {
      setServerError("Failed to connect to the server.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={registerFormStyles.form}>
      {serverError && (
        <div className={registerFormStyles.errorBox}>{serverError}</div>
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
        <div className={registerFormStyles.termsRow}>
          <input
            type="checkbox"
            id="terms"
            {...register("acceptTerms")}
            className={registerFormStyles.termsCheckbox}
          />
          <label htmlFor="terms" className={registerFormStyles.termsLabel}>
            I agree to the{" "}
            <a href="/terms" className={registerFormStyles.termsLink}>
              Terms and Conditions
            </a>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className={registerFormStyles.termsError}>
            {errors.acceptTerms.message}
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={registerFormStyles.submitButton}
        >
          {isSubmitting && (
            <div className={registerFormStyles.submitSpinner}>
              <Spinner size="sm" />
            </div>
          )}
          {/* The Text - its position remains stable */}
          <span
            className={cn(isSubmitting && registerFormStyles.submitTextHidden)}
          >
            Register
          </span>
        </button>
      </SmartFormProvider>
    </form>
  );
}
