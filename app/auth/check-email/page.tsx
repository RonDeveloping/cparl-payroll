// app/auth/check-email/page.tsx

"use client";

import { Suspense } from "react";
import CheckEmailNotice from "@/components/auth/check-email-notice";
import { authStyles } from "@/constants/styles";

export default function CheckEmailPage() {
  return (
    // The Suspense boundary MUST wrap the component using useSearchParams
    <Suspense
      fallback={<div className={authStyles.loadingContainer}>Loading...</div>}
    >
      <CheckEmailNotice />
    </Suspense>
  );
}
