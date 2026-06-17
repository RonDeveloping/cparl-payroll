"use client";
// app/auth/login/page.tsx

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginAction } from "@/lib/actions/auth-actions";
import { ROUTES } from "@/constants/routes";
import { authStyles } from "@/constants/styles";
import { Clarification } from "@/components/clarification";
import { PasswordInput } from "@/components/form/password-input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [passwordSetupUrl, setPasswordSetupUrl] = useState<string | null>(null);

  const initialEmail = searchParams.get("email") || "";
  const [emailValue, setEmailValue] = useState(initialEmail);

  const justRegistered = searchParams.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setPasswordSetupUrl(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = (formData.get("password") as string) || "";

    const result = await loginAction({ email, password });

    if (result.success) {
      if (result.data.requiresPasswordSetup) {
        setPasswordSetupUrl(result.data.setupUrl);
        setLoading(false);
        return;
      }

      if (result.data.requiresTwoFactor) {
        const destinationEmail = result.data.email ?? email;
        toast.success("Verification code sent to your login email.");
        router.push(
          `${ROUTES.AUTH.LOGIN_2FA}?email=${encodeURIComponent(destinationEmail)}`,
        );
        return;
      }

      toast.success("Welcome back!");
      router.prefetch(ROUTES.DASHBOARD.HOME);
      router.refresh();
      router.push(ROUTES.DASHBOARD.HOME);
    } else {
      toast.error(result.error || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className={authStyles.loginCard}>
      <div className={authStyles.loginHeader}>
        <h1 className={authStyles.loginTitle}>Log In</h1>
      </div>

      {justRegistered && (
        <div className={authStyles.loginBanner}>
          Registration successful! Please sign in.
        </div>
      )}

      {passwordSetupUrl && (
        <div className={authStyles.loginBanner}>
          <p className="mb-2">
            It looks like you haven&apos;t finished setting up your account
            password yet.
          </p>
          <Link
            href={passwordSetupUrl}
            className="font-semibold text-blue-700 underline"
          >
            Click here to set up your password.
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className={authStyles.loginForm}>
        <div className={authStyles.loginFieldGroup}>
          <label className={authStyles.loginFieldLabel}>Email Address</label>
          <div className={authStyles.loginInputWrapper}>
            <Mail className={authStyles.loginEmailIcon} />
            <input
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className={authStyles.loginInput}
              value={emailValue}
              onChange={(e) => {
                setEmailValue(e.target.value);
                setPasswordSetupUrl(null);
              }}
            />
          </div>
        </div>

        <div className={authStyles.loginFieldGroup}>
          <div className={authStyles.loginPasswordHeader}>
            <label className={authStyles.loginFieldLabel}>
              <Clarification
                term="Password"
                description="Use 8+ characters with at least one uppercase, lowercase, number and symbol like !@#$%^&*."
              />
            </label>
            <Link
              href={`${ROUTES.AUTH.FORGOT_PASSWORD}?email=${encodeURIComponent(emailValue)}`}
              className={authStyles.loginForgotLink}
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput label="" name="password" placeholder="••••••••" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={authStyles.loginButton}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit"}
        </button>
      </form>

      <p className={authStyles.loginFooter}>
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.AUTH.REGISTER}
          className={authStyles.loginCreateLink}
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
