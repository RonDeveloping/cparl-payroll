// app/auth/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { askForResetLinkAction } from "@/lib/actions/auth-actions";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { authStyles } from "@/constants/styles";
import { useSearchParams } from "next/navigation";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const searchParams = useSearchParams();
  const emailFromURL = searchParams.get("email") || "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const result = await askForResetLinkAction(email);

    if (result.success) {
      setIsSubmitted(true);
      toast.success(
        "If an account exists for that email, we have sent a password reset link.",
      );
    } else {
      toast.error(result.error || "Something went wrong");
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className={authStyles.forgotPasswordCardCenter}>
        <div className={authStyles.forgotPasswordIcon}>
          <Mail size={32} />
        </div>
        <h1 className={authStyles.forgotPasswordTitle}>Check your email</h1>
        <p className={authStyles.forgotPasswordText}>
          If an account exists for that email, we have sent a password reset
          link.
        </p>
        <Link
          href={ROUTES.AUTH.LOGIN}
          className={authStyles.forgotPasswordBackLink}
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className={authStyles.forgotPasswordCard}>
      <h1 className={authStyles.forgotPasswordTitle}>Forgot Password?</h1>
      <p className={authStyles.forgotPasswordDescription}>
        Enter your email to receive a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className={authStyles.forgotPasswordForm}>
        <div>
          <label className={authStyles.forgotPasswordLabel}>
            Email Address
          </label>
          <input
            required
            name="email"
            type="email"
            placeholder="you@example.com"
            defaultValue={emailFromURL}
            className={authStyles.forgotPasswordInput}
          />
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className={authStyles.forgotPasswordButton}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <div className={authStyles.forgotPasswordFooter}>
        <Link
          href={ROUTES.AUTH.LOGIN}
          className={authStyles.forgotPasswordFooterLink}
        >
          Remember your password? Log in
        </Link>
      </div>
    </div>
  );
}
