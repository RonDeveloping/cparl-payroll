"use client";
// components/auth/setup-password-form.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  setupPasswordSchema,
  SetupPasswordInput,
} from "@/lib/validations/password-schema";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { registerFormStyles } from "@/constants/styles";
import { FormGrid } from "../form/form-grid";
import InputWithChanges from "../form/input-with-changes";
import { SmartFormProvider } from "../form/form-change-context";

import { Spinner } from "../shared/spinner";
import { cn } from "@/lib/utils";
import { setupPasswordContent } from "@/constants/content";
import { activateAccount, setPassword } from "@/lib/api";
import { toast } from "sonner";

type ActivationResult = { email?: string };
const activationInFlight = new Map<string, Promise<ActivationResult>>();

export default function SetupPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [pendingEmail, setPendingEmail] = useState<string | null>(() => {
    if (typeof window === "undefined" || !token) {
      return null;
    }

    return sessionStorage.getItem(`activated-email:${token}`);
  });
  const [activationError, setActivationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    // On mount, create user with null password and remove token
    if (!token) return;

    const cacheKey = `activated-email:${token}`;
    if (pendingEmail) {
      return;
    }

    let active = true;

    let request = activationInFlight.get(token);
    if (!request) {
      request = activateAccount(token);
      activationInFlight.set(token, request);
    }

    request
      .then((data) => {
        if (!active) return;
        if (!data?.email) {
          setActivationError("Activation failed.");
          return;
        }
        sessionStorage.setItem(cacheKey, data.email);
        setPendingEmail(data.email);
        setActivationError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        const message =
          err instanceof Error ? err.message : "Activation failed.";
        setActivationError(message);
      })
      .finally(() => {
        if (activationInFlight.get(token) === request) {
          activationInFlight.delete(token);
        }
      });

    return () => {
      active = false;
    };
  }, [token, pendingEmail]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SetupPasswordInput>({
    resolver: zodResolver(setupPasswordSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });

  const onSubmit = async (data: SetupPasswordInput) => {
    try {
      if (!pendingEmail) {
        const message =
          "Activation email is missing. Please restart from the verification link.";
        setSubmitError(message);
        toast.error(message);
        return;
      }

      setSubmitError(null);
      await setPassword(pendingEmail, data.password, data.confirmPassword);

      if (token) {
        sessionStorage.removeItem(`activated-email:${token}`);
      }

      toast.success("Password saved. Please log in.");
      router.replace(
        `${ROUTES.AUTH.LOGIN}?email=${encodeURIComponent(pendingEmail)}`,
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save password.";
      setSubmitError(message);
      toast.error(message);
    }
  };

  // Always show the form; token is already validated upstream

  if (!token) {
    return (
      <div className={registerFormStyles.errorBox}>
        Missing verification token.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={registerFormStyles.form}>
      {activationError && (
        <div className={registerFormStyles.errorBox}>{activationError}</div>
      )}
      {submitError && (
        <div className={registerFormStyles.errorBox}>{submitError}</div>
      )}
      {pendingEmail && (
        <div className="mb-4 text-black font-medium text-center">
          <span>{setupPasswordContent.verifiedMessage(pendingEmail)}</span>
        </div>
      )}
      <SmartFormProvider<SetupPasswordInput>
        value={{ register, changes: [], showChanges: false }}
      >
        <FormGrid>
          <InputWithChanges<SetupPasswordInput>
            key="password"
            name="password"
            label="Password"
            error={errors.password?.message}
            type="password"
          />
          <InputWithChanges<SetupPasswordInput>
            key="confirmPassword"
            name="confirmPassword"
            label="Confirm password"
            error={errors.confirmPassword?.message}
            type="password"
          />
        </FormGrid>
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
          disabled={!isValid || isSubmitting || !pendingEmail}
          className={registerFormStyles.submitButton}
        >
          {isSubmitting && (
            <div className={registerFormStyles.submitSpinner}>
              <Spinner size="sm" />
            </div>
          )}
          <span
            className={cn(isSubmitting && registerFormStyles.submitTextHidden)}
          >
            Save
          </span>
        </button>
      </SmartFormProvider>
    </form>
  );
}
