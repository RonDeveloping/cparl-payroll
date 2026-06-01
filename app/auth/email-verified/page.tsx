// // app/auth/verify/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authStyles } from "@/constants/styles";
import { ROUTES } from "@/constants/routes";
import { verifyEmail, VerifyEmailError } from "@/lib/api";

export default function VerifyPages() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailFromQuery = searchParams.get("email");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      const params = new URLSearchParams();
      params.set("statusCategory", "already-verified");
      params.set("message", "This verification link is invalid or broken.");
      if (emailFromQuery) params.set("email", emailFromQuery);
      console.log(
        "Redirecting to /auth/verification-status with params:",
        params.toString(),
      );
      router.replace(`/auth/verification-status?${params.toString()}`);
      return;
    }

    // Check token status via API
    verifyEmail(token)
      .then(() => {
        // Valid token, proceed to setup-password
        router.replace(
          `${ROUTES.AUTH.SETUP_PASSWORD}?token=${encodeURIComponent(token)}`,
        );
      })
      .catch((err: unknown) => {
        const message =
          err instanceof VerifyEmailError
            ? err.message
            : "This verification link is invalid or broken.";
        const errorEmail =
          err instanceof VerifyEmailError ? err.email : undefined;
        let statusCategory: string;
        if (message.includes("verification link has expired")) {
          statusCategory = "expired";
        } else if (
          message.includes("already verified") ||
          message.includes("used already")
        ) {
          statusCategory = "already-verified";
        } else {
          statusCategory = "already-verified";
        }
        const params = new URLSearchParams();
        params.set("statusCategory", statusCategory);
        if (emailFromQuery) {
          params.set("email", emailFromQuery);
        } else if (errorEmail) {
          params.set("email", errorEmail);
        }
        params.set("message", message);
        router.replace(`/auth/verification-status?${params.toString()}`);
      })
      .finally(() => setLoading(false));
  }, [token, router, searchParams, emailFromQuery]);

  if (!token || loading) {
    return null;
  }

  return (
    <div className={authStyles.emailVerificationContainer}>
      <div className={authStyles.successCard}>
        <h1 className={authStyles.successTitle}>Email Verified!</h1>
        <p className={authStyles.successMessage}>
          Email verified! Redirecting to set up your password…
        </p>
      </div>
    </div>
  );
}
