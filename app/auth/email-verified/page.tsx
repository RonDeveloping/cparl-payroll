//auth/email-verified/page.tsx
import { verifyEmailAction } from "@/lib/actions/veri-email";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { authStyles } from "@/constants/styles";

export default async function VerifyPages({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className={authStyles.missingTokenContainer}>
        <h1 className={authStyles.missingTokenTitle}>Missing Token</h1>
        <p>This verification link is invalid or broken.</p>
      </div>
    );
  }

  const result = await verifyEmailAction(token);

  // 1. Handle Error State
  if (!result.success) {
    return (
      <div className={authStyles.emailVerificationContainer}>
        <div className={authStyles.errorCard}>
          <h1 className={authStyles.errorTitle}>Verification Failed</h1>
          {/* Use result.error here now that we've checked !result.success */}
          <p className={authStyles.errorMessage}>{result.error}</p>
          <Link href={ROUTES.AUTH.RESEND} className={authStyles.errorLink}>
            Request a new verification link
          </Link>
        </div>
      </div>
    );
  }

  // 2. Handle Success State
  return (
    <div className={authStyles.emailVerificationContainer}>
      <div className={authStyles.successCard}>
        <h1 className={authStyles.successTitle}>Email Verified!</h1>
        <p className={authStyles.successMessage}>
          Thank you. Your account is now active.
        </p>
        <Link href={ROUTES.AUTH.LOGIN} className={authStyles.successButton}>
          Sign In
        </Link>
      </div>
    </div>
  );
}
