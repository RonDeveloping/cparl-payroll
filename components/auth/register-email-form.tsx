"use client";
// components/auth/register-email-form.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerEmailSchema,
  RegisterEmailInput,
} from "@/lib/validations/register-email-schema";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { authStyles } from "@/constants/styles";

export default function RegisterEmailForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterEmailInput>({
    resolver: zodResolver(registerEmailSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });
  const router = useRouter();

  const onSubmit = async (data: RegisterEmailInput) => {
    setServerError(null);
    try {
      const response = await fetch(ROUTES.API.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setServerError(result.error || "An unexpected error occurred.");
        return;
      }

      const nextFlow =
        result.flow === "setup-password" ? "setup-password" : null;
      const query = new URLSearchParams({ email: data.email });
      if (nextFlow) {
        query.set("flow", nextFlow);
      }

      router.push(`${ROUTES.AUTH.CHECK_EMAIL}?${query.toString()}`);
    } catch {
      setServerError("Failed to connect to the server.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={authStyles.form}>
      {serverError && <div className={authStyles.errorBox}>{serverError}</div>}
      <div className={authStyles.fieldGroup}>
        <label htmlFor="email" className={authStyles.fieldLabel}>
          Email Address
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={authStyles.input}
          placeholder="name@example.com"
          required
        />
        {errors.email && (
          <p className={authStyles.fieldError}>{errors.email.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className={authStyles.submitButton}
      >
        {isSubmitting ? "Sending..." : "Send Verification Email"}
      </button>
    </form>
  );
}
