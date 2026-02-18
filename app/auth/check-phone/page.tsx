// app/auth/check-phone/page.tsx

"use client";

import { Suspense } from "react";
import CheckPhoneNotice from "@/components/auth/check-phone-notice";
import { authStyles } from "@/constants/styles";

export default function CheckPhonePage() {
  return (
    // The Suspense boundary MUST wrap the component using useSearchParams
    <Suspense
      fallback={<div className={authStyles.loadingContainer}>Loading...</div>}
    >
      <CheckPhoneNotice />
    </Suspense>
  );
}
