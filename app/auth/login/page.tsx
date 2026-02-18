"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { loginAction } from "@/lib/actions/auth-actions";
import { ROUTES } from "@/constants/routes";
import { authStyles } from "@/constants/styles";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ ADDED: State to track the email input
  const [emailValue, setEmailValue] = useState("");

  // Check if we arrived here after a successful registration
  const justRegistered = searchParams.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await loginAction({ email, password });

    if (result.success) {
      toast.success("Welcome back!");
      // 1. Tell the router to prefetch the dashboard (makes it faster)
      router.prefetch(ROUTES.DASHBOARD.HOME);
      // 2. Refresh to clear server-side cache
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
        <h1 className={authStyles.loginTitle}>Sign In</h1>
        <p className={authStyles.loginSubtitle}>
          Enter your credentials to access your account
        </p>
      </div>

      {justRegistered && (
        <div className={authStyles.loginBanner}>
          Registration successful! Please sign in.
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
              onChange={(e) => setEmailValue(e.target.value)}
            />
          </div>
        </div>

        <div className={authStyles.loginFieldGroup}>
          <div className={authStyles.loginPasswordHeader}>
            <label className={authStyles.loginFieldLabel}>Password</label>
            <Link
              href={`${ROUTES.AUTH.FORGOT_PASSWORD}?email=${encodeURIComponent(emailValue)}`}
              className={authStyles.loginForgotLink}
            >
              Forgot password?
            </Link>
          </div>
          <div className={authStyles.loginInputWrapper}>
            <Lock className={authStyles.loginPasswordIcon} />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className={authStyles.loginPasswordInput}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={authStyles.loginPasswordToggle}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={authStyles.loginButton}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
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
