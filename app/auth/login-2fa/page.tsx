"use client";
// app/auth/login-2fa/page.tsx

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  resendLogin2FAAction,
  verifyLogin2FAAction,
} from "@/lib/actions/auth-actions";
import { authStyles } from "@/constants/styles";
import { ROUTES } from "@/constants/routes";

export default function Login2FAPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your login email";

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await verifyLogin2FAAction(code);

    if (result.success) {
      toast.success("Signed in successfully.");
      router.prefetch(ROUTES.DASHBOARD.HOME);
      router.refresh();
      router.push(ROUTES.DASHBOARD.HOME);
      return;
    }

    toast.error(result.error || "Invalid code.");
    setIsSubmitting(false);
  };

  const handleResend = async () => {
    setIsResending(true);
    const result = await resendLogin2FAAction();

    if (result.success) {
      toast.success("A new code was sent to your email.");
    } else {
      toast.error(result.error || "Unable to resend code.");
    }

    setIsResending(false);
  };

  return (
    <div className={authStyles.loginCard}>
      <div className={authStyles.loginHeader}>
        <div className="mb-3 flex justify-center">
          <ShieldCheck className="h-10 w-10 text-blue-600" />
        </div>
        <h1 className={authStyles.loginTitle}>Two-factor verification</h1>
        <p className={authStyles.loginSubtitle}>
          Enter the 5-digit code sent to {email}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={authStyles.loginForm}>
        <div className={authStyles.loginFieldGroup}>
          <label className={authStyles.loginFieldLabel}>
            Verification Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={5}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="12345"
            className={authStyles.loginInput}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || code.length !== 5}
          className={authStyles.loginButton}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Verify and continue"
          )}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="w-full rounded-md border border-slate-300 py-2 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-70"
        >
          {isResending ? "Sending..." : "Resend code"}
        </button>
      </form>

      <p className={authStyles.loginFooter}>
        Entered the wrong email?{" "}
        <Link href={ROUTES.AUTH.LOGIN} className={authStyles.loginCreateLink}>
          Go back to login
        </Link>
      </p>
    </div>
  );
}
