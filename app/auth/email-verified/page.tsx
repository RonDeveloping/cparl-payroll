"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authStyles } from "@/constants/styles";
import { ROUTES } from "@/constants/routes";

export default function VerifyPages() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      const params = new URLSearchParams();
      params.set("type", "expired");
      params.set("message", "This verification link is invalid or broken.");
      router.replace(`/auth/verification-status?${params.toString()}`);
      return;
    }

    // Check token status via API
    fetch(`/api/verify-email-token?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          let type: string | null = null;
          if (
            data.error &&
            data.error.includes("verification link has expired")
          ) {
            type = "expired";
          } else if (data.error && data.error.includes("already verified")) {
            type = "already-verified";
          } else {
            type = "expired";
          }
          const params = new URLSearchParams();
          params.set("type", type);
          if (data.email) params.set("email", data.email);
          if (data.error) params.set("message", data.error);
          router.replace(`/auth/verification-status?${params.toString()}`);
        } else {
          // Valid token, proceed to setup-password
          router.replace(
            `${ROUTES.AUTH.SETUP_PASSWORD}?token=${encodeURIComponent(token)}`,
          );
        }
      })
      .catch(() => {
        const params = new URLSearchParams();
        params.set("type", "expired");
        params.set("message", "This verification link is invalid or broken.");
        router.replace(`/auth/verification-status?${params.toString()}`);
      })
      .finally(() => setLoading(false));
  }, [token, router]);

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
