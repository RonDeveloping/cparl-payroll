"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authStyles } from "@/constants/styles";
import { ROUTES } from "@/constants/routes";

export default function VerifyPages() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      router.replace(
        `${ROUTES.AUTH.SETUP_PASSWORD}?token=${encodeURIComponent(token)}`,
      );
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className={authStyles.missingTokenContainer}>
        <h1 className={authStyles.missingTokenTitle}>Missing Token</h1>
        <p>This verification link is invalid or broken.</p>
      </div>
    );
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
